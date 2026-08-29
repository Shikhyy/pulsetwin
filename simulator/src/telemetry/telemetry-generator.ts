import { SeededRng } from '../rng';
import { StationConfig } from '../factory/factory-layout';
import { StationProductionState } from '../production/production-state';
import { GroundTruthStore } from '../ground-truth/ground-truth-store';

export type StateClass = 'MEASURED' | 'INFERRED' | 'PREDICTED' | 'SIMULATED' | 'UNKNOWN';

export interface Observation {
  stationId: string;
  signal: string;
  value: number | null;
  timestamp: Date;
  unit: string;
  stateClass: StateClass;
}

export class TelemetryGenerator {
  private rng: SeededRng;
  private groundTruth: GroundTruthStore;
  
  // Track ongoing drifts
  private drifts: Map<string, { startValue: number, currentMean: number, targetMean: number, ratePerMin: number, startTimestamp: number }> = new Map();

  constructor(rng: SeededRng, groundTruth: GroundTruthStore) {
    this.rng = rng;
    this.groundTruth = groundTruth;
  }

  public applyDrift(stationId: string, signal: string, startValue: number, targetMean: number, ratePerMin: number, startTimestamp: number): void {
    const key = `${stationId}-${signal}`;
    this.drifts.set(key, { startValue, currentMean: startValue, targetMean, ratePerMin, startTimestamp });
  }

  public generateReadings(
    station: StationConfig, 
    state: StationProductionState, 
    timestamp: Date, 
    elapsedMsSinceLastTick: number
  ): Observation[] {
    const observations: Observation[] = [];
    const isRunning = state.isRunning && !state.isBlocked && !state.isStarved;

    for (const sensor of station.sensors) {
      // Outage logic: 0.1% chance per reading if we're feeling spicy, but let's keep it clean unless injected
      // For now, no random outages unless specified

      let mean = sensor.nominalMean;
      let std = sensor.nominalStd;

      // Check for applied drift
      const driftKey = `${station.id}-${sensor.signal}`;

      const driftInfo = this.drifts.get(driftKey);
      if (driftInfo) {
        const elapsedMinutes = (timestamp.getTime() - driftInfo.startTimestamp) / 60000;
        const driftAmount = elapsedMinutes * driftInfo.ratePerMin;
        
        let newMean = driftInfo.startValue + driftAmount;
        if ((driftInfo.ratePerMin > 0 && newMean > driftInfo.targetMean) || 
            (driftInfo.ratePerMin < 0 && newMean < driftInfo.targetMean)) {
          newMean = driftInfo.targetMean;
        }
        mean = newMean;
        driftInfo.currentMean = newMean;
      }

      // If station is not running, adjust values logically
      if (!isRunning) {
        if (sensor.signal === 'motor_state') mean = 0;
        if (sensor.signal === 'power_draw') mean = 0.5; // idle power
        if (sensor.signal === 'vibration') mean = 0.1; // idle vibration
        if (sensor.signal === 'torque') mean = 0; 
      }

      // Add Gaussian noise
      let value = this.rng.nextGaussian(mean, std);

      // Add high frequency jitter (±2%)
      const jitter = value * this.rng.nextFloat(-0.02, 0.02);
      value += jitter;

      // Clamp to physical limits
      if (value < sensor.minValue) value = sensor.minValue;
      if (value > sensor.maxValue) value = sensor.maxValue;

      observations.push({
        stationId: station.id,
        signal: sensor.signal,
        value: sensor.isMeasured ? value : null,
        timestamp,
        unit: sensor.unit,
        stateClass: sensor.isMeasured ? 'MEASURED' : 'UNKNOWN'
      });
    }

    return observations;
  }
}
