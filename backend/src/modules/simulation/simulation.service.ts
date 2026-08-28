/**
 * Discrete-Event Simulation Engine
 *
 * Pure function — no side effects, no DB access, deterministic given same seed.
 * LIVE STATE ≠ SIMULATION STATE — this module never touches live tables.
 */

export interface StationSimConfig {
  id: string;
  cycleTimeMean: number;    // seconds
  cycleTimeStd: number;     // seconds
  failureRatePerHour: number; // failures/hour
  mttrMinutes: number;       // mean time to repair
  bufferCapacity: number;
}

export interface SimulationInput {
  stations: StationSimConfig[];
  stationOrder: string[];            // ordered production route
  interventions: SimulationIntervention[];
  horizonMinutes: number;
  seedBaseline: number;
  seedScenario: number;
}

export interface SimulationIntervention {
  stationId: string;
  parameter: 'cycle_time' | 'failure_rate' | 'capacity';
  changePercent: number;             // e.g. +8 or -15
  durationMinutes: number;
}

export interface SimulationResultData {
  throughput: number;                // units/hour
  totalUnitsCompleted: number;
  stationUtilization: Record<string, number>;  // 0-1
  stationQueueLength: Record<string, number>;  // end queue length
  stationQueueGrowth: Record<string, number>;  // delta from start
  bottleneckStationId: string;
  bottleneckProbability: number;     // 0-1
  productionLoss: number;            // units lost vs ideal
  qualityImpact: number;             // delta defect rate (0-1)
  recoveryTimeMinutes: number;
  totalDowntimeMinutes: number;
}

export interface ComparisonData {
  throughputDelta: number;           // scenario - baseline (units/hour)
  throughputDeltaPercent: number;
  utilizationDelta: Record<string, number>;
  queueDelta: Record<string, number>;
  bottleneckRiskDelta: number;       // 0-1
  productionLossDelta: number;
  affectedStations: string[];
  summary: string;
}

// ─── Seeded LCG RNG ───────────────────────────────────────────────────────────
class SimRng {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0; }
  next(): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
  gaussian(mean: number, std: number): number {
    // Box-Muller
    const u1 = this.next(), u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
    return Math.max(0, mean + z * std);
  }
  exponential(mean: number): number {
    return -mean * Math.log(Math.max(this.next(), 1e-10));
  }
}

// ─── Core DES Logic ───────────────────────────────────────────────────────────

interface StationRuntimeState {
  id: string;
  cycleTimeMean: number;
  cycleTimeStd: number;
  failureRatePerHour: number;
  mttrMinutes: number;
  bufferCapacity: number;
  // Runtime
  queue: number;
  isDown: boolean;
  timeUntilNextFailure: number;    // minutes
  timeUntilRepairComplete: number; // minutes (when isDown)
  busyUntil: number;               // sim minute when current unit finishes
  unitsCompleted: number;
  totalBusyMinutes: number;
  totalDownMinutes: number;
  totalBlockedMinutes: number;
  totalStarvedMinutes: number;
  peakQueue: number;
  startQueue: number;
}

function cloneStations(
  configs: StationSimConfig[],
  interventions: SimulationIntervention[],
  applyInterventions: boolean
): StationRuntimeState[] {
  return configs.map(cfg => {
    let cycleTimeMean = cfg.cycleTimeMean;
    let failureRatePerHour = cfg.failureRatePerHour;
    let bufferCapacity = cfg.bufferCapacity;

    if (applyInterventions) {
      for (const inv of interventions) {
        if (inv.stationId === cfg.id) {
          const factor = 1 + inv.changePercent / 100;
          if (inv.parameter === 'cycle_time') cycleTimeMean *= factor;
          if (inv.parameter === 'failure_rate') failureRatePerHour = Math.max(0, failureRatePerHour * factor);
          if (inv.parameter === 'capacity') bufferCapacity = Math.max(1, Math.round(bufferCapacity * factor));
        }
      }
    }

    return {
      id: cfg.id,
      cycleTimeMean,
      cycleTimeStd: cfg.cycleTimeStd,
      failureRatePerHour,
      mttrMinutes: cfg.mttrMinutes,
      bufferCapacity,
      queue: 0,
      isDown: false,
      timeUntilNextFailure: 0,
      timeUntilRepairComplete: 0,
      busyUntil: 0,
      unitsCompleted: 0,
      totalBusyMinutes: 0,
      totalDownMinutes: 0,
      totalBlockedMinutes: 0,
      totalStarvedMinutes: 0,
      peakQueue: 0,
      startQueue: 0,
    };
  });
}

/**
 * Run one DES pass. Resolution: 1 simulated minute per tick.
 * Simulates a flow-shop: production units enter at station[0] and flow through.
 */
function runDES(
  input: SimulationInput,
  applyInterventions: boolean,
  seed: number
): SimulationResultData {
  const rng = new SimRng(seed);
  const stationMap = new Map<string, StationRuntimeState>();
  const stateArr = cloneStations(input.stations, input.interventions, applyInterventions);
  
  for (const s of stateArr) {
    // Initialize time-to-failure (exponential distribution)
    const failureInterval = s.failureRatePerHour > 0 ? 60 / s.failureRatePerHour : 1e9;
    s.timeUntilNextFailure = rng.exponential(failureInterval);
    s.startQueue = 0;
    stationMap.set(s.id, s);
  }

  // Takt time: new unit enters line every N minutes
  const TAKT_MINUTES = 8;
  let nextUnitEntryAt = 0;
  let totalUnitsEntered = 0;
  let totalUnitsCompleted = 0;
  const horizon = input.horizonMinutes;

  // Simulation loop — 1-minute resolution
  for (let t = 0; t < horizon; t++) {
    const ordered = input.stationOrder.map(id => stationMap.get(id)!).filter(Boolean);
    
    // New unit enters first station
    if (t >= nextUnitEntryAt) {
      const first = ordered[0];
      if (first && first.queue < first.bufferCapacity) {
        first.queue++;
        if (first.queue > first.peakQueue) first.peakQueue = first.queue;
        totalUnitsEntered++;
        nextUnitEntryAt = t + TAKT_MINUTES;
      }
    }

    // Process each station
    for (let si = 0; si < ordered.length; si++) {
      const st = ordered[si];
      const downstream = si < ordered.length - 1 ? ordered[si + 1] : null;

      // Failure events
      if (!st.isDown) {
        st.timeUntilNextFailure -= 1;
        if (st.timeUntilNextFailure <= 0) {
          st.isDown = true;
          st.timeUntilRepairComplete = rng.gaussian(st.mttrMinutes, st.mttrMinutes * 0.2);
          const failureInterval = st.failureRatePerHour > 0 ? 60 / st.failureRatePerHour : 1e9;
          st.timeUntilNextFailure = rng.exponential(failureInterval);
        }
      }

      if (st.isDown) {
        st.totalDownMinutes++;
        st.timeUntilRepairComplete = Math.max(0, st.timeUntilRepairComplete - 1);
        if (st.timeUntilRepairComplete <= 0) {
          st.isDown = false;
        }
        continue;
      }

      // Check if blocked (downstream buffer full)
      const isBlocked = downstream !== null && downstream.queue >= downstream.bufferCapacity;
      if (isBlocked) {
        st.totalBlockedMinutes++;
        continue;
      }

      // Check if starved (no units waiting)
      if (st.queue === 0) {
        st.totalStarvedMinutes++;
        continue;
      }

      // Process unit
      if (t >= st.busyUntil) {
        const cycleTime = rng.gaussian(st.cycleTimeMean, st.cycleTimeStd) / 60; // minutes
        st.busyUntil = t + cycleTime;
        st.queue = Math.max(0, st.queue - 1);
        st.totalBusyMinutes += cycleTime;
        st.unitsCompleted++;

        // Pass to downstream
        if (downstream) {
          downstream.queue = Math.min(downstream.bufferCapacity, downstream.queue + 1);
          if (downstream.queue > downstream.peakQueue) downstream.peakQueue = downstream.queue;
        } else {
          // Left the system
          totalUnitsCompleted++;
        }
      } else {
        st.totalBusyMinutes++;
      }
    }
  }

  // Compute metrics
  const utilization: Record<string, number> = {};
  const queueLength: Record<string, number> = {};
  const queueGrowth: Record<string, number> = {};
  let bottleneckId = input.stationOrder[0];
  let maxUtil = 0;
  let totalDowntime = 0;

  for (const id of input.stationOrder) {
    const st = stationMap.get(id);
    if (!st) continue;
    const util = Math.min(0.99, st.totalBusyMinutes / horizon);
    utilization[id] = util;
    queueLength[id] = st.queue;
    queueGrowth[id] = st.queue - st.startQueue;
    totalDowntime += st.totalDownMinutes;
    if (util > maxUtil) {
      maxUtil = util;
      bottleneckId = id;
    }
  }

  const idealThroughput = horizon / TAKT_MINUTES;
  const throughputPerHour = (totalUnitsCompleted / horizon) * 60;
  const productionLoss = Math.max(0, idealThroughput - totalUnitsCompleted);

  // Estimate quality impact from bottleneck pressure
  const qualityImpact = maxUtil > 0.9 ? (maxUtil - 0.9) * 0.3 : 0; // 0-3% increase in defect rate

  // Recovery time: estimate based on downstream queue clearance
  const downstreamQueue = input.stationOrder
    .slice(input.stationOrder.indexOf(bottleneckId) + 1)
    .reduce((sum, id) => sum + (stationMap.get(id)?.queue ?? 0), 0);
  const avgDownstreamCycle = 5; // minutes
  const recoveryTimeMinutes = downstreamQueue * avgDownstreamCycle;

  return {
    throughput: Math.round(throughputPerHour * 100) / 100,
    totalUnitsCompleted,
    stationUtilization: utilization,
    stationQueueLength: queueLength,
    stationQueueGrowth: queueGrowth,
    bottleneckStationId: bottleneckId,
    bottleneckProbability: maxUtil > 0.9 ? 0.85 : maxUtil > 0.8 ? 0.5 : 0.2,
    productionLoss: Math.round(productionLoss * 10) / 10,
    qualityImpact: Math.round(qualityImpact * 1000) / 1000,
    recoveryTimeMinutes: Math.round(recoveryTimeMinutes),
    totalDowntimeMinutes: Math.round(totalDowntime),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function runSimulation(input: SimulationInput): Promise<{
  baseline: SimulationResultData;
  scenario: SimulationResultData;
  comparison: ComparisonData;
}> {
  const baseline = runDES(input, false, input.seedBaseline);
  const scenario = runDES(input, true, input.seedScenario);

  const utilizationDelta: Record<string, number> = {};
  const queueDelta: Record<string, number> = {};
  const affectedStations: string[] = [];

  for (const id of input.stationOrder) {
    const uDelta = (scenario.stationUtilization[id] ?? 0) - (baseline.stationUtilization[id] ?? 0);
    const qDelta = (scenario.stationQueueGrowth[id] ?? 0) - (baseline.stationQueueGrowth[id] ?? 0);
    utilizationDelta[id] = Math.round(uDelta * 1000) / 1000;
    queueDelta[id] = Math.round(qDelta * 10) / 10;
    if (Math.abs(uDelta) > 0.05 || Math.abs(qDelta) > 0.5) {
      affectedStations.push(id);
    }
  }

  const throughputDelta = scenario.throughput - baseline.throughput;
  const throughputDeltaPercent = baseline.throughput > 0
    ? Math.round((throughputDelta / baseline.throughput) * 1000) / 10
    : 0;

  const summary = throughputDelta < 0
    ? `Throughput reduced by ${Math.abs(throughputDeltaPercent)}%. ${affectedStations.length} stations affected.`
    : `Throughput improved by ${throughputDeltaPercent}%. ${affectedStations.length} stations affected.`;

  return {
    baseline,
    scenario,
    comparison: {
      throughputDelta: Math.round(throughputDelta * 100) / 100,
      throughputDeltaPercent,
      utilizationDelta,
      queueDelta,
      bottleneckRiskDelta: scenario.bottleneckProbability - baseline.bottleneckProbability,
      productionLossDelta: scenario.productionLoss - baseline.productionLoss,
      affectedStations,
      summary,
    },
  };
}

/**
 * Builds SimulationInput from current station config + live state.
 * Called by simulation routes.
 */
export function buildSimulationInput(
  stations: Array<{ externalId: string; cycleTimeTarget: number; cycleTimeStd: number; bufferCapacity: number }>,
  interventions: SimulationIntervention[],
  horizonMinutes: number
): SimulationInput {
  const stationConfigs: StationSimConfig[] = stations.map(s => ({
    id: s.externalId,
    cycleTimeMean: s.cycleTimeTarget,
    cycleTimeStd: s.cycleTimeStd,
    failureRatePerHour: 0.1,  // default: 1 failure / 10 hours
    mttrMinutes: 15,
    bufferCapacity: s.bufferCapacity,
  }));

  return {
    stations: stationConfigs,
    stationOrder: stations.map(s => s.externalId),
    interventions,
    horizonMinutes,
    seedBaseline: 42,
    seedScenario: 42,
  };
}
