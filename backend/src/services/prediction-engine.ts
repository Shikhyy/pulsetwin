import { db } from '../db/connection.js';
import { stations, predictions } from '../db/schema.js';
import { mlClient } from './ml-client.js';
import { wsManager } from '../realtime/websocket-manager.js';
import { getStationState } from '../modules/stations/stations.service.js';
import { eq } from 'drizzle-orm';

export class PredictionEngine {
  private timer: NodeJS.Timeout | null = null;

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.runEvaluationLoop().catch(console.error);
    }, 30000); // 30s
    console.log('🔮 Prediction Engine started');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runEvaluationLoop() {
    const allStations = await db.select().from(stations);
    
    for (const station of allStations) {
      // 1. Query latest observations
      const state = await getStationState(station.id);
      
      // 2. Compute features
      const features = {
        utilization: state.utilization,
        cycleTimeMean: state.currentCycleTime,
        queue: state.queueLength || 0,
      };

      // 3. Call ML Service
      const pred = await mlClient.getPrediction(station.id, features);
      if (pred && pred.probability > 0.5) {
        // 4. Store prediction
        const [stored] = await db.insert(predictions).values({
          entityId: station.id,
          entityType: 'station',
          type: 'BOTTLENECK',
          probability: pred.probability,
          horizonMinutes: pred.horizon_minutes || 20,
          confidence: pred.confidence || 0.8,
          evidence: (pred.evidence || []) as any,
          modelVersion: pred.model_version || '1.0.0',
          stateClass: 'PREDICTED',
          timestamp: new Date()
        }).returning();

        // Broadcast to WebSocket clients
        wsManager.broadcastEvent({
          type: 'PREDICTION_CREATED',
          timestamp: new Date().toISOString(),
          payload: {
            id: stored.id,
            type: stored.type as any,
            targetId: stored.entityId,
            probability: stored.probability,
            horizon: stored.horizonMinutes * 60_000, // convert minutes to ms
            confidence: stored.confidence,
            evidence: (stored.evidence as any) || [],
            modelVersion: stored.modelVersion,
            timestamp: stored.timestamp.toISOString()
          }
        });
      }
    }
  }
}

export const predictionEngine = new PredictionEngine();
