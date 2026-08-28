import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  real,
  integer,
  boolean,
  pgEnum,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const stateClassEnum = pgEnum('state_class', [
  'MEASURED',
  'INFERRED',
  'PREDICTED',
  'SIMULATED',
  'UNKNOWN',
]);

export const stationStatusEnum = pgEnum('station_status', [
  'RUNNING',
  'IDLE',
  'BLOCKED',
  'STARVED',
  'DEGRADED',
  'MAINTENANCE',
  'WARNING',
  'CRITICAL',
  'OFFLINE',
]);

export const zoneTypeEnum = pgEnum('zone_type', [
  'BODY_CONSTRUCTION',
  'PAINT',
  'FINAL_ASSEMBLY',
]);

export const instrumentationProfileEnum = pgEnum('instrumentation_profile', [
  'RICH',
  'PARTIAL',
  'MANUAL_ONLY',
  'SENSOR_POOR',
]);

export const predictionTypeEnum = pgEnum('prediction_type', [
  'BOTTLENECK',
  'DEFECT',
  'ANOMALY',
  'EQUIPMENT_FAILURE',
]);

export const productionUnitStatusEnum = pgEnum('production_unit_status', [
  'IN_PROGRESS',
  'COMPLETED',
  'SCRAPPED',
  'REWORK',
]);

export const qualityResultEnum = pgEnum('quality_result', [
  'PASS',
  'FAIL',
  'MARGINAL',
  'PENDING',
]);

export const scenarioStatusEnum = pgEnum('scenario_status', [
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
]);

export const recommendationStatusEnum = pgEnum('recommendation_status', [
  'ACTIVE',
  'ACKNOWLEDGED',
  'IMPLEMENTED',
  'DISMISSED',
  'EXPIRED',
]);

export const controlCommandStatusEnum = pgEnum('control_command_status', [
  'PENDING',
  'APPROVED',
  'EXECUTING',
  'SUCCESS',
  'FAILED',
  'REJECTED',
  'EXPIRED',
]);

export const userRoleEnum = pgEnum('user_role', [
  'OPERATOR',
  'ENGINEER',
  'MANAGER',
  'ADMIN',
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const plants = pgTable('plants', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  timezone: varchar('timezone', { length: 64 }).notNull().default('UTC'),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const lines = pgTable('lines', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  plantId: uuid('plant_id').notNull().references(() => plants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const zones = pgTable('zones', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  lineId: uuid('line_id').notNull().references(() => lines.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: zoneTypeEnum('type').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const stations = pgTable('stations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  // Stable external identifier like 'ST-01', 'ST-18'
  externalId: varchar('external_id', { length: 32 }).notNull().unique(),
  zoneId: uuid('zone_id').notNull().references(() => zones.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  index: integer('index').notNull(),
  position: jsonb('position').notNull().default({ x: 0, y: 0, z: 0 }),
  cycleTimeTarget: real('cycle_time_target').notNull(), // seconds
  cycleTimeStd: real('cycle_time_std').notNull().default(5),
  bufferCapacity: integer('buffer_capacity').notNull().default(3),
  instrumentationProfile: instrumentationProfileEnum('instrumentation_profile').notNull().default('PARTIAL'),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const equipment = pgTable('equipment', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  stationId: uuid('station_id').notNull().references(() => stations.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 128 }).notNull(),
  model: varchar('model', { length: 255 }),
  installDate: timestamp('install_date', { withTimezone: true }),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const sensors = pgTable('sensors', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  stationId: uuid('station_id').notNull().references(() => stations.id, { onDelete: 'cascade' }),
  equipmentId: uuid('equipment_id').references(() => equipment.id, { onDelete: 'set null' }),
  signal: varchar('signal', { length: 128 }).notNull(), // 'torque', 'vibration', etc.
  unit: varchar('unit', { length: 32 }).notNull(),
  hasMeasurement: boolean('has_measurement').notNull().default(true),
  nominalMean: real('nominal_mean'),
  nominalStd: real('nominal_std'),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const productionUnits = pgTable('production_units', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  lineId: uuid('line_id').notNull().references(() => lines.id),
  model: varchar('model', { length: 128 }).notNull(),
  serial: varchar('serial', { length: 64 }).notNull().unique(),
  status: productionUnitStatusEnum('status').notNull().default('IN_PROGRESS'),
  currentStationId: uuid('current_station_id').references(() => stations.id, { onDelete: 'set null' }),
  enteredLineAt: timestamp('entered_line_at', { withTimezone: true }).notNull(),
  exitedLineAt: timestamp('exited_line_at', { withTimezone: true }),
  positionFraction: real('position_fraction').default(0), // 0-1 progress within current station
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
});

// High-volume table — carefully indexed
export const observations = pgTable('observations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  entityId: uuid('entity_id').notNull(), // stationId, equipmentId, productionUnitId
  entityType: varchar('entity_type', { length: 64 }).notNull(), // 'station' | 'equipment' | 'production_unit'
  signal: varchar('signal', { length: 128 }).notNull(),
  value: real('value'), // null = missing data (NEVER store 0 for missing!)
  unit: varchar('unit', { length: 32 }),
  stateClass: stateClassEnum('state_class').notNull().default('MEASURED'),
  quality: real('quality').default(1.0), // 0-1 data quality score
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  source: varchar('source', { length: 128 }).notNull(), // 'simulator' | 'plc' | 'manual' | 'inferred'
  provenance: jsonb('provenance').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => ({
  entitySignalTimeIdx: index('obs_entity_signal_time_idx').on(table.entityId, table.signal, table.timestamp),
  timestampIdx: index('obs_timestamp_idx').on(table.timestamp),
  entityTypeIdx: index('obs_entity_type_idx').on(table.entityType),
}));

export const events = pgTable('events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  entityId: uuid('entity_id').notNull(),
  entityType: varchar('entity_type', { length: 64 }).notNull(),
  type: varchar('type', { length: 128 }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  severity: integer('severity').notNull().default(1), // 1-5
  details: jsonb('details').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => ({
  entityTimeIdx: index('evt_entity_time_idx').on(table.entityId, table.timestamp),
  timestampIdx: index('evt_timestamp_idx').on(table.timestamp),
}));

export const qualityObservations = pgTable('quality_observations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  productionUnitId: uuid('production_unit_id').notNull().references(() => productionUnits.id),
  stationId: uuid('station_id').notNull().references(() => stations.id),
  characteristic: varchar('characteristic', { length: 128 }).notNull(),
  result: qualityResultEnum('result').notNull().default('PENDING'),
  value: real('value'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  inspectorId: uuid('inspector_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => ({
  unitStationIdx: index('qo_unit_station_idx').on(table.productionUnitId, table.stationId),
}));

export const predictions = pgTable('predictions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  entityId: uuid('entity_id').notNull(),
  entityType: varchar('entity_type', { length: 64 }).notNull(),
  type: predictionTypeEnum('type').notNull(),
  probability: real('probability').notNull(),
  horizonMinutes: integer('horizon_minutes').notNull(),
  confidence: real('confidence').notNull(),
  evidence: jsonb('evidence').notNull().default([]),
  modelVersion: varchar('model_version', { length: 64 }).notNull(),
  stateClass: stateClassEnum('state_class').notNull().default('PREDICTED'),
  isActive: boolean('is_active').notNull().default(true),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => ({
  entityActiveIdx: index('pred_entity_active_idx').on(table.entityId, table.isActive),
  timestampIdx: index('pred_timestamp_idx').on(table.timestamp),
}));

export const scenarios = pgTable('scenarios', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  baseline: jsonb('baseline').notNull().default({}),
  interventions: jsonb('interventions').notNull().default([]),
  horizonMinutes: integer('horizon_minutes').notNull().default(60),
  assumptions: jsonb('assumptions').notNull().default({}),
  modelVersion: varchar('model_version', { length: 64 }).notNull(),
  status: scenarioStatusEnum('status').notNull().default('PENDING'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const simulationResults = pgTable('simulation_results', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: uuid('scenario_id').notNull().references(() => scenarios.id, { onDelete: 'cascade' }),
  throughput: real('throughput'), // units/hour
  queueGrowth: jsonb('queue_growth').default({}), // stationId -> units
  utilization: jsonb('utilization').default({}), // stationId -> 0-1
  bottleneckProbability: real('bottleneck_probability'),
  qualityImpact: real('quality_impact'), // delta defect rate
  productionLoss: real('production_loss'), // units lost
  recoveryTimeMinutes: real('recovery_time_minutes'),
  affectedStations: jsonb('affected_stations').default([]),
  stateClass: stateClassEnum('state_class').notNull().default('SIMULATED'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  predictionId: uuid('prediction_id').references(() => predictions.id),
  scenarioId: uuid('scenario_id').references(() => scenarios.id),
  action: text('action').notNull(),
  expectedImpact: jsonb('expected_impact').notNull().default({}),
  evidence: jsonb('evidence').notNull().default([]),
  confidence: real('confidence').notNull(),
  affectedStations: jsonb('affected_stations').notNull().default([]),
  risks: jsonb('risks').notNull().default([]),
  status: recommendationStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

export const controlCommands = pgTable('control_commands', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  recommendationId: uuid('recommendation_id').references(() => recommendations.id),
  target: varchar('target', { length: 255 }).notNull(),
  parameter: varchar('parameter', { length: 128 }).notNull(),
  requestedValue: jsonb('requested_value').notNull(),
  previousValue: jsonb('previous_value'),
  requestedBy: uuid('requested_by').notNull(),
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  executedAt: timestamp('executed_at', { withTimezone: true }),
  result: jsonb('result'),
  status: controlCommandStatusEnum('status').notNull().default('PENDING'),
  auditLog: jsonb('audit_log').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('OPERATOR'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 128 }).notNull(),
  entityId: uuid('entity_id'),
  entityType: varchar('entity_type', { length: 64 }),
  details: jsonb('details').notNull().default({}),
  ipAddress: varchar('ip_address', { length: 64 }),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => ({
  timestampIdx: index('audit_timestamp_idx').on(table.timestamp),
  userIdx: index('audit_user_idx').on(table.userId),
}));
