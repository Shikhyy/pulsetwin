export type InstrumentationProfile = 'RICH' | 'PARTIAL' | 'MANUAL_ONLY' | 'SENSOR_POOR';

export interface SensorDef {
  signal: string;
  unit: string;
  nominalMean: number;
  nominalStd: number;
  minValue: number;
  maxValue: number;
  readingIntervalMs: number;
  isMeasured: boolean;
}

export interface StationConfig {
  id: string;
  name: string;
  index: number;
  zoneId: string;
  cycleTimeTarget: number;
  cycleTimeStd: number;
  bufferCapacity: number;
  instrumentationProfile: InstrumentationProfile;
  sensors: SensorDef[];
  downstreamStationId: string | null;
}

function generateDefaultSensors(profile: InstrumentationProfile): SensorDef[] {
  const isMeasured = profile !== 'MANUAL_ONLY';
  const sensors: SensorDef[] = [
    { signal: 'cycle_time', unit: 's', nominalMean: 60, nominalStd: 2, minValue: 0, maxValue: 120, readingIntervalMs: 1000, isMeasured: true },
    { signal: 'motor_state', unit: 'state', nominalMean: 1, nominalStd: 0, minValue: 0, maxValue: 1, readingIntervalMs: 1000, isMeasured: isMeasured },
  ];

  if (profile === 'RICH' || profile === 'PARTIAL') {
    sensors.push({ signal: 'temperature', unit: 'C', nominalMean: 22, nominalStd: 1.5, minValue: -10, maxValue: 100, readingIntervalMs: 1000, isMeasured: true });
    sensors.push({ signal: 'power_draw', unit: 'kW', nominalMean: 5.5, nominalStd: 0.3, minValue: 0, maxValue: 20, readingIntervalMs: 1000, isMeasured: true });
  }

  if (profile === 'RICH') {
    sensors.push({ signal: 'vibration', unit: 'mm/s', nominalMean: 2.1, nominalStd: 0.2, minValue: 0, maxValue: 10, readingIntervalMs: 500, isMeasured: true });
    sensors.push({ signal: 'torque', unit: 'Nm', nominalMean: 30, nominalStd: 1, minValue: 0, maxValue: 100, readingIntervalMs: 200, isMeasured: true });
  }

  return sensors;
}

export const FACTORY_STATIONS: StationConfig[] = Array.from({ length: 40 }).map((_, i) => {
  const index = i + 1;
  const id = `ST-${index.toString().padStart(2, '0')}`;
  
  let name = `Assembly Station ${index}`;
  let cycleTimeTarget = 120;
  let cycleTimeStd = 5;
  let instrumentationProfile: InstrumentationProfile = 'PARTIAL';
  let bufferCapacity = 2;
  
  // Specific overrides based on requirements
  if (index === 1) {
    name = 'Body Drop Entry';
    cycleTimeTarget = 240;
    cycleTimeStd = 10;
    instrumentationProfile = 'RICH';
  } else if (index === 12) {
    name = 'Chassis Fastening (Torque)';
    cycleTimeTarget = 180;
    cycleTimeStd = 4;
    instrumentationProfile = 'RICH';
  } else if (index === 18) {
    name = 'E-Coat Oven';
    cycleTimeTarget = 480;
    cycleTimeStd = 15;
    instrumentationProfile = 'RICH';
    bufferCapacity = 10;
  } else if (index === 21) {
    name = 'Primer Oven';
    cycleTimeTarget = 420;
    cycleTimeStd = 12;
    instrumentationProfile = 'SENSOR_POOR';
  } else if (index === 31) {
    name = 'Electrical Harness Installation';
    cycleTimeTarget = 180;
    cycleTimeStd = 20; // High human variability
    instrumentationProfile = 'MANUAL_ONLY';
  } else if (index === 39) {
    name = 'Final Quality Inspection';
    cycleTimeTarget = 300;
    cycleTimeStd = 15;
    instrumentationProfile = 'RICH';
    bufferCapacity = 5;
  }

  const sensors = generateDefaultSensors(instrumentationProfile);
  
  // Custom sensor overrides for ST-12 Torque Station
  if (index === 12) {
    const torqueSensor = sensors.find(s => s.signal === 'torque');
    if (torqueSensor) {
      torqueSensor.nominalMean = 45;
      torqueSensor.nominalStd = 2;
    }
  }
  
  // Custom sensor overrides for ST-21 Primer Oven
  if (index === 21) {
    // Only cycle_time and motor_state
    sensors.length = 0;
    sensors.push(
      { signal: 'cycle_time', unit: 's', nominalMean: 420, nominalStd: 12, minValue: 0, maxValue: 800, readingIntervalMs: 1000, isMeasured: true },
      { signal: 'motor_state', unit: 'state', nominalMean: 1, nominalStd: 0, minValue: 0, maxValue: 1, readingIntervalMs: 1000, isMeasured: true }
    );
  }

  // Custom sensor overrides for ST-31 Harness
  if (index === 31) {
    sensors.length = 0;
    sensors.push(
      { signal: 'manual_torque', unit: 'Nm', nominalMean: 15, nominalStd: 5, minValue: 0, maxValue: 30, readingIntervalMs: 5000, isMeasured: false } // Unknown/manual
    );
  }

  return {
    id,
    name,
    index,
    zoneId: `Zone-${Math.ceil(index / 10)}`,
    cycleTimeTarget,
    cycleTimeStd,
    bufferCapacity,
    instrumentationProfile,
    sensors,
    downstreamStationId: index < 40 ? `ST-${(index + 1).toString().padStart(2, '0')}` : null
  };
});

