import type { Vec3, ZoneType } from './domain';

export type InstrumentationProfile = 'RICH' | 'PARTIAL' | 'MANUAL_ONLY' | 'SENSOR_POOR';

export interface SensorConfig {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly unit: string;
  readonly updateFrequencyMs: number;
  readonly stateClass: 'MEASURED' | 'INFERRED' | 'MANUAL';
}

export interface EquipmentConfig {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly manufacturer: string;
  readonly model: string;
  readonly sensors: readonly SensorConfig[];
}

export interface StationConfig {
  readonly id: string;
  readonly name: string;
  readonly index: number;
  readonly zoneId: string;
  readonly position: Vec3;
  readonly cycleTimeTarget: number; // ms
  readonly cycleTimeStd: number; // ms (standard deviation)
  readonly bufferCapacity: number;
  readonly instrumentationProfile: InstrumentationProfile;
  readonly equipment: readonly EquipmentConfig[];
}

export interface ZoneConfig {
  readonly id: string;
  readonly name: string;
  readonly type: ZoneType;
  readonly index: number;
  readonly stations: readonly StationConfig[];
}

export interface ProductionLineConfig {
  readonly id: string;
  readonly name: string;
  readonly zones: readonly ZoneConfig[];
}

export interface FactoryConfig {
  readonly id: string;
  readonly name: string;
  readonly lines: readonly ProductionLineConfig[];
}

export interface ProductionRoute {
  readonly id: string;
  readonly name: string;
  readonly stationIds: readonly string[];
}
