import { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.js';
import {
  observations, events, qualityObservations, predictions,
  recommendations, productionUnits, stations
} from '../../db/schema.js';
import { wsManager } from '../../realtime/websocket-manager.js';
import { eq, sql } from 'drizzle-orm';

let demoScenarioState: 'idle' | 'running' | 'triggered' = 'idle';
let demoStartTime: Date | null = null;

export async function demoRoutes(fastify: FastifyInstance) {

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/demo/status
  // ──────────────────────────────────────────────────────────────────────────
  fastify.get('/status', async () => {
    return {
      scenario: demoScenarioState,
      startedAt: demoStartTime?.toISOString() ?? null,
      stepsCompleted: demoScenarioState === 'triggered' ? 18 : 0,
    };
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /api/demo/reset — wipe all live data, return to baseline
  // ──────────────────────────────────────────────────────────────────────────
  fastify.post('/reset', async () => {
    // Delete in dependency order
    await db.delete(recommendations);
    await db.delete(predictions);
    await db.delete(qualityObservations);
    await db.delete(events);
    await db.delete(observations);

    // Reset all production units to initial station
    const firstStation = await db.query.stations.findFirst({
      where: eq(stations.externalId, 'ST-01'),
    });
    if (firstStation) {
      await db.update(productionUnits)
        .set({ currentStationId: firstStation.id, status: 'IN_PROGRESS', positionFraction: 0 });
    }

    demoScenarioState = 'idle';
    demoStartTime = null;

    wsManager.broadcastEvent({
      type: 'TELEMETRY_UPDATE',
      timestamp: new Date().toISOString(),
      payload: { targetId: 'system', metrics: { reset: 1 }, timestamp: new Date().toISOString() },
    });

    return { success: true, message: 'Demo reset to initial state' };
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /api/demo/trigger-scenario
  // Injects the complete demo scenario immediately without waiting for real time.
  // This is the key demo accelerator.
  // ──────────────────────────────────────────────────────────────────────────
  fastify.post('/trigger-scenario', async () => {
    if (demoScenarioState === 'running') {
      return { success: false, message: 'Scenario already running' };
    }

    demoScenarioState = 'running';
    demoStartTime = new Date();

    // Look up station database IDs
    const st12 = await db.query.stations.findFirst({ where: eq(stations.externalId, 'ST-12') });
    const st18 = await db.query.stations.findFirst({ where: eq(stations.externalId, 'ST-18') });
    const st39 = await db.query.stations.findFirst({ where: eq(stations.externalId, 'ST-39') });

    if (!st12 || !st18 || !st39) {
      demoScenarioState = 'idle';
      return { success: false, message: 'Station records not found — run seed first' };
    }

    const now = new Date();
    const t = (offsetMinutes: number) => new Date(now.getTime() - offsetMinutes * 60_000);

    // ── Step 1: Inject ST-12 torque drift observations (T-42min to now) ────
    const st12Observations = generateTorqueDriftObservations(st12.id, t(42), now);
    await db.insert(observations).values(st12Observations);

    // ── Step 2: Inject ST-18 cycle time drift (T-35min to now) ─────────────
    const st18Observations = generateCycleTimeDriftObservations(st18.id, t(35), now);
    await db.insert(observations).values(st18Observations);

    // Broadcast real-time updates
    await sleep(100);

    // ── Step 3: ST-12 anomaly event ─────────────────────────────────────────
    await db.insert(events).values({
      entityId: st12.id,
      entityType: 'station',
      type: 'SENSOR_ANOMALY',
      timestamp: t(25),
      severity: 3,
      details: {
        signal: 'torque',
        value: 51.2,
        threshold: 45.0,
        deviation: '+13.8%',
        message: 'Torque reading 13.8% above target (51.2Nm vs 45Nm target)',
      },
    });

    wsManager.broadcastEvent({
      type: 'ANOMALY_DETECTED',
      timestamp: t(25).toISOString(),
      payload: {
        id: crypto.randomUUID(),
        targetId: st12.id,
        description: 'Torque process drifting: +13.8% deviation detected at ST-12',
        timestamp: t(25).toISOString(),
      },
    });

    await sleep(300);

    // ── Step 4: ST-18 bottleneck prediction ──────────────────────────────────
    const [bottleneckPrediction] = await db.insert(predictions).values({
      entityId: st18.id,
      entityType: 'station',
      type: 'BOTTLENECK',
      probability: 0.82,
      horizonMinutes: 18,
      confidence: 0.76,
      evidence: [
        {
          signal: 'cycle_time',
          direction: 'contributing',
          strength: 0.91,
          description: 'Cycle time rising: 519s vs 480s target (+8.1% over 35 minutes)',
          value: 519,
          threshold: 480,
          dataClass: 'MEASURED',
        },
        {
          signal: 'queue_length',
          direction: 'contributing',
          strength: 0.74,
          description: 'Queue growing: 2.4 units average (was 0.8 units)',
          value: 2.4,
          threshold: 2.0,
          dataClass: 'MEASURED',
        },
        {
          signal: 'utilization',
          direction: 'contributing',
          strength: 0.68,
          description: 'Station utilization at 87% (approaching critical 90% threshold)',
          value: 0.87,
          threshold: 0.90,
          dataClass: 'INFERRED',
        },
        {
          signal: 'downstream_capacity',
          direction: 'mitigating',
          strength: 0.32,
          description: 'Downstream stations ST-19 and ST-20 currently have available buffer',
          value: 0.65,
          threshold: 0.85,
          dataClass: 'MEASURED',
        },
      ] as any,
      modelVersion: 'bottleneck-v1.2.0',
      stateClass: 'PREDICTED',
      isActive: true,
      timestamp: t(5),
    }).returning();

    wsManager.broadcastEvent({
      type: 'PREDICTION_CREATED',
      timestamp: t(5).toISOString(),
      payload: {
        id: bottleneckPrediction.id,
        type: 'BOTTLENECK',
        targetId: st18.id,
        probability: 0.82,
        horizon: 18 * 60_000,
        confidence: 0.76,
        evidence: bottleneckPrediction.evidence as any[],
        modelVersion: 'bottleneck-v1.2.0',
        timestamp: t(5).toISOString(),
      },
    });

    // Trigger the Pulse visual effect
    wsManager.broadcastEvent({
      type: 'TELEMETRY_UPDATE',
      timestamp: new Date().toISOString(),
      payload: {
        targetId: st18.id,
        metrics: {
          pulse_trigger: 1,
          pulse_type: 0, // 0=bottleneck
          bottleneck_risk: 0.82,
        },
        timestamp: new Date().toISOString(),
      },
    });

    await sleep(500);

    // ── Step 5: ST-12 defect prediction ──────────────────────────────────────
    const [defectPrediction] = await db.insert(predictions).values({
      entityId: st12.id,
      entityType: 'station',
      type: 'DEFECT',
      probability: 0.67,
      horizonMinutes: 42,
      confidence: 0.71,
      evidence: [
        {
          signal: 'torque',
          direction: 'contributing',
          strength: 0.89,
          description: 'Torque drift: +13.8% above nominal (51.2Nm vs 45Nm). Historical: 78% defect rate above +10%.',
          value: 51.2,
          threshold: 45.0,
          dataClass: 'MEASURED',
        },
        {
          signal: 'vibration_trend',
          direction: 'contributing',
          strength: 0.45,
          description: 'Co-occurring vibration increase: +0.4mm/s over 15 minutes',
          value: 2.1,
          threshold: 1.8,
          dataClass: 'MEASURED',
        },
        {
          signal: 'station_history',
          direction: 'contributing',
          strength: 0.35,
          description: 'Similar torque drift patterns preceded 3 of last 4 quality failures at this station',
          value: 0.75,
          threshold: 0.5,
          dataClass: 'INFERRED',
        },
      ] as any,
      modelVersion: 'defect-v1.1.0',
      stateClass: 'PREDICTED',
      isActive: true,
      timestamp: t(3),
    }).returning();

    // ── Step 6: Quality observation at ST-39 (delayed detection) ─────────────
    const affectedUnit = await db.query.productionUnits.findFirst();
    if (affectedUnit) {
      await db.insert(qualityObservations).values({
        productionUnitId: affectedUnit.id,
        stationId: st39.id,
        characteristic: 'torque_fastener_compliance',
        result: 'FAIL',
        value: 51.2,
        timestamp: t(2),
        notes: 'Torque spec out of range. Likely introduced at body construction. Vehicle routed to rework.',
      });

      await db.insert(events).values({
        entityId: affectedUnit.id,
        entityType: 'production_unit',
        type: 'QUALITY_FAILURE',
        timestamp: t(2),
        severity: 4,
        details: {
          characteristic: 'torque_fastener_compliance',
          stationId: st39.externalId,
          value: 51.2,
          likelyCause: 'Torque drift at ST-12 (42 minutes earlier)',
        },
      });
    }

    await sleep(200);

    // ── Step 7: Generate recommendation ──────────────────────────────────────
    await db.insert(recommendations).values({
      predictionId: bottleneckPrediction.id,
      action: 'Investigate ST-18 E-Coat Oven cycle time regulation before the next scheduled maintenance window. Check oven temperature controller calibration and heating element condition.',
      expectedImpact: {
        bottleneckRiskReduction: '12–18%',
        additionalCapacityMinutes: '7–11',
        downstreamQueueImprovement: 'moderate',
        estimatedThroughputGain: '+0.8–1.2 units/hr',
      },
      evidence: [
        'Cycle-time drift: +8.1% over 35 minutes',
        'Queue growth: from 0.8 to 2.4 units (200% increase)',
        'Vibration trend correlation with previous oven failures',
        'Historical: similar drift pattern preceded failure event 3 weeks ago',
      ],
      confidence: 0.74,
      affectedStations: ['ST-18', 'ST-19', 'ST-20'],
      risks: [
        'Maintenance window may impact current shift throughput by 1–2 units',
        'If oven is taken offline, ST-17 will back up within 45 minutes',
      ],
      status: 'ACTIVE',
      expiresAt: new Date(now.getTime() + 2 * 60 * 60_000), // 2 hours
    });

    demoScenarioState = 'triggered';

    // Final broadcast: alert + station state change
    wsManager.broadcastEvent({
      type: 'STATION_STATE_CHANGED',
      timestamp: new Date().toISOString(),
      payload: {
        stationId: st18.id,
        timestamp: new Date().toISOString(),
        status: 'WARNING',
        currentCycleTime: 519,
        utilization: 0.87,
        queueLength: 2,
        blockage: 0.1,
        starvation: 0.0,
        equipmentHealth: 0.72,
        bottleneckRisk: 0.82,
        qualityRisk: 0.15,
        lastUpdated: new Date().toISOString(),
        instrumentation: {
          measuredSignals: 5,
          inferredSignals: 2,
          manualSignals: 0,
          unknownSignals: 0,
          coveragePercent: 95,
        },
      },
    });

    return {
      success: true,
      message: 'Demo scenario injected successfully',
      steps: [
        'ST-12 torque drift observations injected (T-42min to now)',
        'ST-18 cycle time drift observations injected (T-35min to now)',
        'ST-12 sensor anomaly event created',
        'ST-18 bottleneck prediction created (82%, 18min horizon)',
        'ST-12 defect prediction created (67%, 42min horizon)',
        'ST-39 quality failure observation created',
        'Recommendation generated',
        'WebSocket events broadcast to all connected clients',
      ],
    };
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateTorqueDriftObservations(
  stationId: string,
  from: Date,
  to: Date,
): typeof observations.$inferInsert[] {
  const results: typeof observations.$inferInsert[] = [];
  const durationMs = to.getTime() - from.getTime();
  const stepMs = 3 * 60_000; // observation every 3 minutes

  for (let ms = 0; ms < durationMs; ms += stepMs) {
    const ts = new Date(from.getTime() + ms);
    const progressFraction = ms / durationMs;
    // Drift: starts at nominal 45Nm, drifts to 52Nm linearly + noise
    const nominalTorque = 45.0;
    const drift = progressFraction * 7.0;
    const noise = (Math.random() - 0.5) * 1.5;
    const value = nominalTorque + drift + noise;

    results.push({
      entityId: stationId,
      entityType: 'station',
      signal: 'torque',
      value: Math.round(value * 10) / 10,
      unit: 'Nm',
      stateClass: 'MEASURED',
      quality: 0.98,
      timestamp: ts,
      source: 'simulator',
      provenance: { sensor: 'torque-wrench-01', calibrated: true },
    });

    // Vibration also increases slightly with torque drift
    results.push({
      entityId: stationId,
      entityType: 'station',
      signal: 'vibration',
      value: Math.round((1.2 + progressFraction * 0.9 + (Math.random() - 0.5) * 0.2) * 100) / 100,
      unit: 'mm/s',
      stateClass: 'MEASURED',
      quality: 0.95,
      timestamp: ts,
      source: 'simulator',
      provenance: { sensor: 'accel-01' },
    });
  }

  return results;
}

function generateCycleTimeDriftObservations(
  stationId: string,
  from: Date,
  to: Date,
): typeof observations.$inferInsert[] {
  const results: typeof observations.$inferInsert[] = [];
  const durationMs = to.getTime() - from.getTime();
  const stepMs = 4 * 60_000; // observation every 4 minutes

  for (let ms = 0; ms < durationMs; ms += stepMs) {
    const ts = new Date(from.getTime() + ms);
    const progressFraction = ms / durationMs;
    // Drift: starts at 480s (target), rises to ~520s (+8.3%)
    const baseCycleTime = 480;
    const drift = progressFraction * 40;
    const noise = (Math.random() - 0.5) * 10;
    const value = baseCycleTime + drift + noise;

    results.push({
      entityId: stationId,
      entityType: 'station',
      signal: 'cycle_time',
      value: Math.round(value),
      unit: 's',
      stateClass: 'MEASURED',
      quality: 0.99,
      timestamp: ts,
      source: 'simulator',
      provenance: { sensor: 'plc-cycle-counter-18', type: 'counter' },
    });

    // Temperature in oven also drifts slightly (or fails to maintain setpoint)
    results.push({
      entityId: stationId,
      entityType: 'station',
      signal: 'temperature',
      value: Math.round((180 + progressFraction * 8 + (Math.random() - 0.5) * 2) * 10) / 10,
      unit: '°C',
      stateClass: 'MEASURED',
      quality: 0.97,
      timestamp: ts,
      source: 'simulator',
      provenance: { sensor: 'temp-probe-18-01' },
    });
  }

  return results;
}
