/**
 * Base data classifications for PulseTwin states.
 * Indicates the reliability and provenance of data points.
 */
export type StateClass = 'MEASURED' | 'INFERRED' | 'PREDICTED' | 'SIMULATED' | 'UNKNOWN';

/**
 * Valid operational statuses for a factory station.
 */
export type StationStatus = 
  | 'RUNNING'
  | 'IDLE'
  | 'BLOCKED'
  | 'STARVED'
  | 'DEGRADED'
  | 'MAINTENANCE'
  | 'WARNING'
  | 'CRITICAL'
  | 'OFFLINE';

export type EventType = 
  | 'STATION_ENTRY'
  | 'STATION_EXIT'
  | 'DOWNTIME_STARTED'
  | 'DOWNTIME_ENDED'
  | 'ALARM_RAISED'
  | 'ALARM_CLEARED'
  | 'QUALITY_FAILURE'
  | 'SENSOR_ANOMALY'
  | 'PARAMETER_ADJUSTED'
  | 'MAINTENANCE_REQUIRED';

export type ZoneType = 'BODY_CONSTRUCTION' | 'PAINT' | 'FINAL_ASSEMBLY';
export type PredictionType = 'BOTTLENECK' | 'DEFECT' | 'ANOMALY' | 'EQUIPMENT_FAILURE';

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Observation<T = any> {
  readonly id: string;
  readonly timestamp: string;
  readonly value: T;
  readonly stateClass: StateClass;
  readonly source: string;
  readonly provenance?: string;
  readonly qualityScore?: number; // 0-1
}

export interface InstrumentationCoverage {
  readonly measuredSignals: number;
  readonly inferredSignals: number;
  readonly manualSignals: number;
  readonly unknownSignals: number;
  readonly coveragePercent: number; // 0-100
}

export interface StationState {
  readonly stationId: string;
  readonly timestamp: string;
  readonly status: StationStatus;
  readonly currentCycleTime: number; // ms
  readonly utilization: number; // 0-1
  readonly queueLength: number;
  readonly blockage: number; // 0-1 probability/severity
  readonly starvation: number; // 0-1 probability/severity
  readonly equipmentHealth: number; // 0-1
  readonly bottleneckRisk: number; // 0-1
  readonly qualityRisk: number; // 0-1
  readonly lastUpdated: string;
  readonly instrumentation: InstrumentationCoverage;
}

export interface ProductionUnit {
  readonly id: string;
  readonly model: string;
  readonly serial: string;
  readonly status: 'IN_PROGRESS' | 'COMPLETED' | 'SCRAPPED' | 'REWORK';
  readonly currentStationId: string | null;
  readonly enteredLineAt: string;
  readonly position: Vec3 | null;
}

export interface Evidence {
  readonly id: string;
  readonly signal: string;
  readonly direction: 'contributing' | 'mitigating';
  readonly strength: number; // 0-1
  readonly description: string;
  readonly value: number | string;
  readonly threshold?: number;
  readonly dataClass: StateClass;
}

export interface Prediction {
  readonly id: string;
  readonly type: PredictionType;
  readonly targetId: string; // stationId, unitId, equipmentId
  readonly probability: number; // 0-1
  readonly horizon: number; // ms into the future
  readonly timestamp: string;
  readonly confidence: number; // 0-1
  readonly evidence: readonly Evidence[];
  readonly modelVersion: string;
}

export interface QualityObservation extends Observation<boolean> {
  readonly defectType?: string;
  readonly location?: string;
}

export interface Event {
  readonly id: string;
  readonly type: EventType;
  readonly timestamp: string;
  readonly targetId: string;
  readonly payload: Record<string, any>;
  readonly severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface Scenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, number | string | boolean>;
  readonly authorId: string;
  readonly createdAt: string;
}

export interface SimulationResult {
  readonly id: string;
  readonly scenarioId: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  readonly metrics: Record<string, number>;
  readonly timeline: readonly Event[];
}

export interface Recommendation {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly targetId: string;
  readonly expectedImpact: string;
  readonly confidence: number; // 0-1
  readonly predictionId?: string;
  readonly createdAt: string;
}

export interface ControlCommand {
  readonly id: string;
  readonly targetId: string;
  readonly action: string;
  readonly parameters: Record<string, any>;
  readonly requestedBy: string;
  readonly timestamp: string;
  readonly status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
}

// WebSocket Twin Events
export type TwinEventPayloads = {
  STATION_STATE_CHANGED: StationState;
  PRODUCTION_UNIT_MOVED: { unitId: string; fromStationId: string | null; toStationId: string; timestamp: string };
  PREDICTION_CREATED: Prediction;
  ANOMALY_DETECTED: { id: string; targetId: string; description: string; timestamp: string };
  PULSE_TRIGGERED: { timestamp: string };
  SIMULATION_COMPLETE: SimulationResult;
  RECOMMENDATION_CREATED: Recommendation;
  TELEMETRY_UPDATE: { targetId: string; metrics: Record<string, number>; timestamp: string };
};

export type TwinEventType = keyof TwinEventPayloads;

export type TwinEvent = {
  [K in TwinEventType]: {
    type: K;
    payload: TwinEventPayloads[K];
    timestamp: string;
  }
}[TwinEventType];

// Identity
export type UserRole = 'OPERATOR' | 'ENGINEER' | 'MANAGER' | 'ADMIN';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
}

// API wrappers
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
  readonly meta?: {
    readonly timestamp: string;
    readonly requestId: string;
  };
}

export interface PagedResponse<T> extends ApiResponse<readonly T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly hasNext: boolean;
  };
}
