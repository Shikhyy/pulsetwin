import { z } from 'zod';

export const StateClassSchema = z.enum(['MEASURED', 'INFERRED', 'PREDICTED', 'SIMULATED', 'UNKNOWN']);
export const StationStatusSchema = z.enum([
  'RUNNING', 'IDLE', 'BLOCKED', 'STARVED', 'DEGRADED', 
  'MAINTENANCE', 'WARNING', 'CRITICAL', 'OFFLINE'
]);
export const EventTypeSchema = z.enum([
  'STATION_ENTRY', 'STATION_EXIT', 'DOWNTIME_STARTED', 'DOWNTIME_ENDED', 
  'ALARM_RAISED', 'ALARM_CLEARED', 'QUALITY_FAILURE', 'SENSOR_ANOMALY', 
  'PARAMETER_ADJUSTED', 'MAINTENANCE_REQUIRED'
]);
export const ZoneTypeSchema = z.enum(['BODY_CONSTRUCTION', 'PAINT', 'FINAL_ASSEMBLY']);
export const PredictionTypeSchema = z.enum(['BOTTLENECK', 'DEFECT', 'ANOMALY', 'EQUIPMENT_FAILURE']);
export const UserRoleSchema = z.enum(['OPERATOR', 'ENGINEER', 'MANAGER', 'ADMIN']);
export const InstrumentationProfileSchema = z.enum(['RICH', 'PARTIAL', 'MANUAL_ONLY', 'SENSOR_POOR']);

export const Vec3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
}).strict();

export const InstrumentationCoverageSchema = z.object({
  measuredSignals: z.number(),
  inferredSignals: z.number(),
  manualSignals: z.number(),
  unknownSignals: z.number(),
  coveragePercent: z.number().min(0).max(100),
}).strict();

export const StationStateSchema = z.object({
  stationId: z.string(),
  timestamp: z.string().datetime(),
  status: StationStatusSchema,
  currentCycleTime: z.number(),
  utilization: z.number().min(0).max(1),
  queueLength: z.number(),
  blockage: z.number().min(0).max(1),
  starvation: z.number().min(0).max(1),
  equipmentHealth: z.number().min(0).max(1),
  bottleneckRisk: z.number().min(0).max(1),
  qualityRisk: z.number().min(0).max(1),
  lastUpdated: z.string().datetime(),
  instrumentation: InstrumentationCoverageSchema,
}).strict();

export const ProductionUnitSchema = z.object({
  id: z.string(),
  model: z.string(),
  serial: z.string(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'SCRAPPED', 'REWORK']),
  currentStationId: z.string().nullable(),
  enteredLineAt: z.string().datetime(),
  position: Vec3Schema.nullable(),
}).strict();

export const EvidenceSchema = z.object({
  id: z.string(),
  signal: z.string(),
  direction: z.enum(['contributing', 'mitigating']),
  strength: z.number().min(0).max(1),
  description: z.string(),
  value: z.union([z.number(), z.string()]),
  threshold: z.number().optional(),
  dataClass: StateClassSchema,
}).strict();

export const PredictionSchema = z.object({
  id: z.string(),
  type: PredictionTypeSchema,
  targetId: z.string(),
  probability: z.number().min(0).max(1),
  horizon: z.number(),
  timestamp: z.string().datetime(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(EvidenceSchema),
  modelVersion: z.string(),
}).strict();

export const EventSchema = z.object({
  id: z.string(),
  type: EventTypeSchema,
  timestamp: z.string().datetime(),
  targetId: z.string(),
  payload: z.record(z.any()),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
}).strict();

export const SensorConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  unit: z.string(),
  updateFrequencyMs: z.number(),
  stateClass: z.enum(['MEASURED', 'INFERRED', 'MANUAL']),
}).strict();

export const EquipmentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  manufacturer: z.string(),
  model: z.string(),
  sensors: z.array(SensorConfigSchema),
}).strict();

export const StationConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  index: z.number(),
  zoneId: z.string(),
  position: Vec3Schema,
  cycleTimeTarget: z.number(),
  cycleTimeStd: z.number(),
  bufferCapacity: z.number(),
  instrumentationProfile: InstrumentationProfileSchema,
  equipment: z.array(EquipmentConfigSchema),
}).strict();

export const ZoneConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ZoneTypeSchema,
  index: z.number(),
  stations: z.array(StationConfigSchema),
}).strict();

export const ProductionLineConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  zones: z.array(ZoneConfigSchema),
}).strict();

export const FactoryConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  lines: z.array(ProductionLineConfigSchema),
}).strict();

// Create API wrapper schema factories
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
  meta: z.object({
    timestamp: z.string().datetime(),
    requestId: z.string(),
  }).optional(),
}).strict();

export const createPagedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => 
  createApiResponseSchema(z.array(dataSchema)).extend({
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      hasNext: z.boolean(),
    }).strict(),
  });
