export interface ProductionUnitState {
  id: string;
  serial: string;
  model: string;
  currentStationId: string | null;
  position: number; // 0.0-1.0 within current station
  enteredCurrentStationAt: Date | null;
  status: 'IN_PROCESS' | 'WAITING' | 'COMPLETED' | 'BLOCKED';
  qualityFlags: string[]; // hidden ground truth
}

export interface StationProductionState {
  stationId: string;
  currentUnitId: string | null;
  queuedUnitIds: string[];
  isRunning: boolean;
  isBlocked: boolean;
  isStarved: boolean;
  currentCycleTime: number; // seconds, can drift
  utilization: number; // 0-1
  lastEventAt: Date;
}
