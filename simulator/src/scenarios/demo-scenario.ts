export interface ScenarioEvent {
  offsetMinutes: number;
  type: string;
  stationId: string;
  params: Record<string, any>;
}

export const DEMO_SCENARIO: ScenarioEvent[] = [
  {
    offsetMinutes: 10,
    type: 'TORQUE_DRIFT_START',
    stationId: 'ST-12',
    params: {
      driftRatePerMinute: -0.2, // Nm/min
      targetMeanAfterDrift: 35 // down from 45
    }
  },
  {
    offsetMinutes: 18,
    type: 'CYCLE_TIME_DEGRADATION',
    stationId: 'ST-18',
    params: {
      increaseRatePerMinute: 0.005, // +0.5% per minute
    }
  },
  {
    offsetMinutes: 25,
    type: 'SENSOR_NOISE_SPIKE',
    stationId: 'ST-12',
    params: {
      signal: 'vibration',
      stdMultiplier: 3.0
    }
  }
];
