export type ZoneType = 'BODY_CONSTRUCTION' | 'PAINT' | 'FINAL_ASSEMBLY';
export type InstrumentationProfile = 'RICH' | 'PARTIAL' | 'MANUAL_ONLY' | 'SENSOR_POOR';

export interface StationConfig {
  readonly id: string; // e.g. 'ST-01'
  readonly name: string;
  readonly zoneId: string;
  readonly position: [number, number, number];
  readonly cycleTimeTarget: number; // seconds
  readonly cycleTimeStd: number; // seconds
  readonly bufferCapacity: number;
  readonly instrumentationProfile: InstrumentationProfile;
  readonly isBuffer: boolean;
  readonly isDemoBottleneck: boolean;
  readonly isDemoDrift: boolean;
  readonly isFinalInspection: boolean;
  readonly downstreamId: string | null;
}

export interface ZoneConfig {
  readonly id: string;
  readonly name: string;
  readonly type: ZoneType;
}

const ZONE_A = 'zone-a';
const ZONE_B = 'zone-b';
const ZONE_C = 'zone-c';

const stations: StationConfig[] = [
  // ─── Zone A — Body Construction ─────────────────────────────────────────
  { id: 'ST-01', name: 'Underbody Assembly', zoneId: ZONE_A, position: [-45, 0, -15], cycleTimeTarget: 240, cycleTimeStd: 12, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-02' },
  { id: 'ST-02', name: 'Side Panel Left', zoneId: ZONE_A, position: [-35, 0, -15], cycleTimeTarget: 200, cycleTimeStd: 10, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-03' },
  { id: 'ST-03', name: 'Side Panel Right', zoneId: ZONE_A, position: [-25, 0, -15], cycleTimeTarget: 200, cycleTimeStd: 10, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-04' },
  { id: 'ST-04', name: 'Roof Assembly', zoneId: ZONE_A, position: [-15, 0, -15], cycleTimeTarget: 220, cycleTimeStd: 15, bufferCapacity: 2, instrumentationProfile: 'PARTIAL', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-05' },
  { id: 'ST-05', name: 'Front End Assembly', zoneId: ZONE_A, position: [-5, 0, -15], cycleTimeTarget: 180, cycleTimeStd: 9, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-06' },
  { id: 'ST-06', name: 'Door Fitting LF', zoneId: ZONE_A, position: [5, 0, -15], cycleTimeTarget: 150, cycleTimeStd: 12, bufferCapacity: 2, instrumentationProfile: 'MANUAL_ONLY', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-07' },
  { id: 'ST-07', name: 'Door Fitting RF', zoneId: ZONE_A, position: [15, 0, -15], cycleTimeTarget: 150, cycleTimeStd: 12, bufferCapacity: 2, instrumentationProfile: 'MANUAL_ONLY', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-08' },
  { id: 'ST-08', name: 'Door Fitting Rear', zoneId: ZONE_A, position: [-45, 0, -25], cycleTimeTarget: 170, cycleTimeStd: 14, bufferCapacity: 2, instrumentationProfile: 'PARTIAL', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-09' },
  { id: 'ST-09', name: 'Trunk Assembly', zoneId: ZONE_A, position: [-35, 0, -25], cycleTimeTarget: 160, cycleTimeStd: 10, bufferCapacity: 2, instrumentationProfile: 'PARTIAL', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-10' },
  { id: 'ST-10', name: 'Hood Assembly', zoneId: ZONE_A, position: [-25, 0, -25], cycleTimeTarget: 140, cycleTimeStd: 8, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-11' },
  { id: 'ST-11', name: 'Windshield Install', zoneId: ZONE_A, position: [-15, 0, -25], cycleTimeTarget: 120, cycleTimeStd: 7, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-12' },
  // DEMO: ST-12 torque drift station
  { id: 'ST-12', name: 'Torque Station', zoneId: ZONE_A, position: [-5, 0, -25], cycleTimeTarget: 180, cycleTimeStd: 8, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: true, isFinalInspection: false, downstreamId: 'ST-13' },
  { id: 'ST-13', name: 'Body Geometry Insp.', zoneId: ZONE_A, position: [5, 0, -25], cycleTimeTarget: 90, cycleTimeStd: 5, bufferCapacity: 4, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-14' },
  { id: 'ST-14', name: 'Body Buffer', zoneId: ZONE_A, position: [15, 0, -25], cycleTimeTarget: 60, cycleTimeStd: 5, bufferCapacity: 8, instrumentationProfile: 'SENSOR_POOR', isBuffer: true, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-15' },

  // ─── Zone B — Paint ──────────────────────────────────────────────────────
  { id: 'ST-15', name: 'Sealing & Undercoat', zoneId: ZONE_B, position: [-45, 0, 5], cycleTimeTarget: 300, cycleTimeStd: 20, bufferCapacity: 2, instrumentationProfile: 'PARTIAL', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-16' },
  { id: 'ST-16', name: 'E-Coat Prep', zoneId: ZONE_B, position: [-35, 0, 5], cycleTimeTarget: 240, cycleTimeStd: 12, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-17' },
  { id: 'ST-17', name: 'E-Coat Application', zoneId: ZONE_B, position: [-25, 0, 5], cycleTimeTarget: 360, cycleTimeStd: 18, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-18' },
  // DEMO: ST-18 bottleneck station
  { id: 'ST-18', name: 'E-Coat Oven', zoneId: ZONE_B, position: [-15, 0, 5], cycleTimeTarget: 480, cycleTimeStd: 24, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: true, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-19' },
  { id: 'ST-19', name: 'E-Coat Inspection', zoneId: ZONE_B, position: [-5, 0, 5], cycleTimeTarget: 120, cycleTimeStd: 10, bufferCapacity: 3, instrumentationProfile: 'MANUAL_ONLY', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-20' },
  { id: 'ST-20', name: 'Primer Application', zoneId: ZONE_B, position: [5, 0, -5], cycleTimeTarget: 300, cycleTimeStd: 15, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-21' },
  // SENSOR-POOR: 38% coverage
  { id: 'ST-21', name: 'Primer Oven', zoneId: ZONE_B, position: [15, 0, -5], cycleTimeTarget: 420, cycleTimeStd: 30, bufferCapacity: 2, instrumentationProfile: 'SENSOR_POOR', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-22' },
  { id: 'ST-22', name: 'Top Coat Booth', zoneId: ZONE_B, position: [25, 0, -5], cycleTimeTarget: 360, cycleTimeStd: 20, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-23' },
  { id: 'ST-23', name: 'Clear Coat', zoneId: ZONE_B, position: [35, 0, -5], cycleTimeTarget: 300, cycleTimeStd: 18, bufferCapacity: 2, instrumentationProfile: 'PARTIAL', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-24' },
  { id: 'ST-24', name: 'Paint Cure Oven', zoneId: ZONE_B, position: [45, 0, -5], cycleTimeTarget: 480, cycleTimeStd: 24, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-25' },

  // ─── Zone C — Final Assembly ─────────────────────────────────────────────
  { id: 'ST-25', name: 'Engine Install', zoneId: ZONE_C, position: [-45, 0, 20], cycleTimeTarget: 420, cycleTimeStd: 25, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-26' },
  { id: 'ST-26', name: 'Transmission Install', zoneId: ZONE_C, position: [-35, 0, 20], cycleTimeTarget: 360, cycleTimeStd: 20, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-27' },
  { id: 'ST-27', name: 'Suspension Front', zoneId: ZONE_C, position: [-25, 0, 20], cycleTimeTarget: 300, cycleTimeStd: 18, bufferCapacity: 2, instrumentationProfile: 'PARTIAL', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-28' },
  { id: 'ST-28', name: 'Suspension Rear', zoneId: ZONE_C, position: [-15, 0, 20], cycleTimeTarget: 280, cycleTimeStd: 16, bufferCapacity: 2, instrumentationProfile: 'MANUAL_ONLY', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-29' },
  { id: 'ST-29', name: 'Brake System Install', zoneId: ZONE_C, position: [-5, 0, 20], cycleTimeTarget: 240, cycleTimeStd: 14, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-30' },
  { id: 'ST-30', name: 'Fuel System', zoneId: ZONE_C, position: [5, 0, 20], cycleTimeTarget: 200, cycleTimeStd: 12, bufferCapacity: 2, instrumentationProfile: 'PARTIAL', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-31' },
  // SENSOR-POOR: 42% coverage
  { id: 'ST-31', name: 'Electrical Harness', zoneId: ZONE_C, position: [15, 0, 20], cycleTimeTarget: 360, cycleTimeStd: 22, bufferCapacity: 2, instrumentationProfile: 'SENSOR_POOR', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-32' },
  { id: 'ST-32', name: 'Dashboard Assembly', zoneId: ZONE_C, position: [25, 0, 20], cycleTimeTarget: 300, cycleTimeStd: 18, bufferCapacity: 2, instrumentationProfile: 'PARTIAL', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-33' },
  { id: 'ST-33', name: 'Seat Installation', zoneId: ZONE_C, position: [-45, 0, 30], cycleTimeTarget: 240, cycleTimeStd: 14, bufferCapacity: 2, instrumentationProfile: 'MANUAL_ONLY', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-34' },
  { id: 'ST-34', name: 'Glass Install', zoneId: ZONE_C, position: [-35, 0, 30], cycleTimeTarget: 180, cycleTimeStd: 10, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-35' },
  { id: 'ST-35', name: 'Wheel Alignment', zoneId: ZONE_C, position: [-25, 0, 30], cycleTimeTarget: 150, cycleTimeStd: 8, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-36' },
  { id: 'ST-36', name: 'Fluids Fill', zoneId: ZONE_C, position: [-15, 0, 30], cycleTimeTarget: 120, cycleTimeStd: 7, bufferCapacity: 2, instrumentationProfile: 'PARTIAL', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-37' },
  { id: 'ST-37', name: 'Final Torque Audit', zoneId: ZONE_C, position: [-5, 0, 30], cycleTimeTarget: 90, cycleTimeStd: 5, bufferCapacity: 3, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-38' },
  { id: 'ST-38', name: 'End-of-Line Test', zoneId: ZONE_C, position: [5, 0, 30], cycleTimeTarget: 300, cycleTimeStd: 20, bufferCapacity: 2, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: 'ST-39' },
  // Final inspection — catches delayed quality defects
  { id: 'ST-39', name: 'Final Inspection', zoneId: ZONE_C, position: [15, 0, 30], cycleTimeTarget: 180, cycleTimeStd: 10, bufferCapacity: 4, instrumentationProfile: 'RICH', isBuffer: false, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: true, downstreamId: 'ST-40' },
  { id: 'ST-40', name: 'Shipping / Dispatch', zoneId: ZONE_C, position: [25, 0, 30], cycleTimeTarget: 60, cycleTimeStd: 5, bufferCapacity: 10, instrumentationProfile: 'SENSOR_POOR', isBuffer: true, isDemoBottleneck: false, isDemoDrift: false, isFinalInspection: false, downstreamId: null },
];

export const FACTORY_CONFIG = {
  plant: { id: 'plant-01', name: 'Meridian Assembly Plant Alpha' },
  line: { id: 'line-01', name: 'Line 1' },
  zones: [
    { id: ZONE_A, name: 'Body Construction', type: 'BODY_CONSTRUCTION' as ZoneType },
    { id: ZONE_B, name: 'Paint', type: 'PAINT' as ZoneType },
    { id: ZONE_C, name: 'Final Assembly', type: 'FINAL_ASSEMBLY' as ZoneType },
  ] as ZoneConfig[],
  stations,
} as const;

// Convenience lookups
export const STATION_MAP = new Map(stations.map(s => [s.id, s]));
export const STATIONS_BY_ZONE = new Map([
  [ZONE_A, stations.filter(s => s.zoneId === ZONE_A)],
  [ZONE_B, stations.filter(s => s.zoneId === ZONE_B)],
  [ZONE_C, stations.filter(s => s.zoneId === ZONE_C)],
]);

export const DEMO_BOTTLENECK_STATION = 'ST-18';
export const DEMO_DRIFT_STATION = 'ST-12';
export const FINAL_INSPECTION_STATION = 'ST-39';

/** Returns ordered list of downstream station IDs from a given station */
export function getDownstreamStations(fromId: string): string[] {
  const result: string[] = [];
  let current = STATION_MAP.get(fromId);
  while (current?.downstreamId) {
    result.push(current.downstreamId);
    current = STATION_MAP.get(current.downstreamId);
  }
  return result;
}
