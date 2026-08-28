import { db } from './connection.js';
import { plants, lines, zones, stations, users, equipment, sensors } from './schema.js';
import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function runSeed() {
  console.log('🌱 Seeding database...');

  // Users
  const userSeeds = [
    { email: 'admin@pulsetwin.io', pass: 'admin1234', role: 'ADMIN' as const, name: 'Admin User' },
    { email: 'engineer@pulsetwin.io', pass: 'demo1234', role: 'ENGINEER' as const, name: 'Lead Engineer' },
    { email: 'operator@pulsetwin.io', pass: 'demo1234', role: 'OPERATOR' as const, name: 'Line Operator' },
    { email: 'manager@pulsetwin.io', pass: 'demo1234', role: 'MANAGER' as const, name: 'Plant Manager' },
  ];

  for (const u of userSeeds) {
    const exists = await db.select().from(users).where(eq(users.email, u.email));
    if (exists.length === 0) {
      const passwordHash = await hashPassword(u.pass);
      await db.insert(users).values({ email: u.email, passwordHash, role: u.role, name: u.name });
    }
  }

  // Plant
  let plantList = await db.select().from(plants).where(eq(plants.name, 'Meridian Assembly Plant Alpha'));
  let plant;
  if (plantList.length === 0) {
    [plant] = await db.insert(plants).values({
      name: 'Meridian Assembly Plant Alpha',
      timezone: 'America/New_York',
    }).returning();
  } else {
    plant = plantList[0];
  }

  // Line
  let lineList = await db.select().from(lines).where(eq(lines.plantId, plant.id));
  let line;
  if (lineList.length === 0) {
    [line] = await db.insert(lines).values({
      plantId: plant.id,
      name: 'Line 1',
    }).returning();
  } else {
    line = lineList[0];
  }

  // Zones
  const zoneNames = [
    { name: 'Body Construction', type: 'BODY_CONSTRUCTION' as const },
    { name: 'Paint', type: 'PAINT' as const },
    { name: 'Final Assembly', type: 'FINAL_ASSEMBLY' as const }
  ];
  
  const createdZones: any = {};
  for (const z of zoneNames) {
    let zoneList = await db.select().from(zones).where(and(eq(zones.lineId, line.id), eq(zones.name, z.name)));
    if (zoneList.length === 0) {
      const [newZone] = await db.insert(zones).values({ lineId: line.id, name: z.name, type: z.type }).returning();
      createdZones[z.name] = newZone;
    } else {
      createdZones[z.name] = zoneList[0];
    }
  }

  const zoneA = createdZones['Body Construction'];
  const zoneB = createdZones['Paint'];
  const zoneC = createdZones['Final Assembly'];

  // Stations mapping (exactly as requested, 40 stations)
  const stationDefs = [
    // Zone A (Body Construction, ST-01 to ST-14)
    { id: 'ST-01', zoneId: zoneA.id, name: 'Underbody Assembly', cycleTimeTarget: 240, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -45, y: 0, z: -15 } },
    { id: 'ST-02', zoneId: zoneA.id, name: 'Side Panel Left', cycleTimeTarget: 200, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -35, y: 0, z: -15 } },
    { id: 'ST-03', zoneId: zoneA.id, name: 'Side Panel Right', cycleTimeTarget: 200, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -25, y: 0, z: -15 } },
    { id: 'ST-04', zoneId: zoneA.id, name: 'Roof Assembly', cycleTimeTarget: 220, bufferCapacity: 2, instr: 'PARTIAL' as const, position: { x: -15, y: 0, z: -15 } },
    { id: 'ST-05', zoneId: zoneA.id, name: 'Front End Assembly', cycleTimeTarget: 180, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -5, y: 0, z: -15 } },
    { id: 'ST-06', zoneId: zoneA.id, name: 'Door Fitting Left Front', cycleTimeTarget: 150, bufferCapacity: 2, instr: 'MANUAL_ONLY' as const, position: { x: 5, y: 0, z: -15 } },
    { id: 'ST-07', zoneId: zoneA.id, name: 'Door Fitting Right Front', cycleTimeTarget: 150, bufferCapacity: 2, instr: 'MANUAL_ONLY' as const, position: { x: 15, y: 0, z: -15 } },
    { id: 'ST-08', zoneId: zoneA.id, name: 'Door Fitting Rear', cycleTimeTarget: 170, bufferCapacity: 2, instr: 'PARTIAL' as const, position: { x: -45, y: 0, z: -25 } },
    { id: 'ST-09', zoneId: zoneA.id, name: 'Trunk/Tailgate Assembly', cycleTimeTarget: 160, bufferCapacity: 2, instr: 'PARTIAL' as const, position: { x: -35, y: 0, z: -25 } },
    { id: 'ST-10', zoneId: zoneA.id, name: 'Hood Assembly', cycleTimeTarget: 140, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -25, y: 0, z: -25 } },
    { id: 'ST-11', zoneId: zoneA.id, name: 'Windshield Install', cycleTimeTarget: 120, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -15, y: 0, z: -25 } },
    { id: 'ST-12', zoneId: zoneA.id, name: 'Torque Station', cycleTimeTarget: 180, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -5, y: 0, z: -25 } },
    { id: 'ST-13', zoneId: zoneA.id, name: 'Body Geometry Inspection', cycleTimeTarget: 90, bufferCapacity: 4, instr: 'RICH' as const, position: { x: 5, y: 0, z: -25 } },
    { id: 'ST-14', zoneId: zoneA.id, name: 'Body Buffer Zone', cycleTimeTarget: 60, bufferCapacity: 8, instr: 'SENSOR_POOR' as const, position: { x: 15, y: 0, z: -25 } },

    // Zone B (Paint, ST-15 to ST-24)
    { id: 'ST-15', zoneId: zoneB.id, name: 'Sealing and Undercoating', cycleTimeTarget: 300, bufferCapacity: 2, instr: 'PARTIAL' as const, position: { x: -45, y: 0, z: 5 } },
    { id: 'ST-16', zoneId: zoneB.id, name: 'E-Coat Prep', cycleTimeTarget: 240, bufferCapacity: 2, instr: 'RICH' as const, position: { x: -35, y: 0, z: 5 } },
    { id: 'ST-17', zoneId: zoneB.id, name: 'E-Coat Application', cycleTimeTarget: 360, bufferCapacity: 2, instr: 'RICH' as const, position: { x: -25, y: 0, z: 5 } },
    { id: 'ST-18', zoneId: zoneB.id, name: 'E-Coat Oven', cycleTimeTarget: 480, bufferCapacity: 2, instr: 'RICH' as const, position: { x: -15, y: 0, z: 5 } },
    { id: 'ST-19', zoneId: zoneB.id, name: 'E-Coat Inspection', cycleTimeTarget: 120, bufferCapacity: 3, instr: 'MANUAL_ONLY' as const, position: { x: -5, y: 0, z: 5 } },
    { id: 'ST-20', zoneId: zoneB.id, name: 'Primer Application', cycleTimeTarget: 300, bufferCapacity: 2, instr: 'RICH' as const, position: { x: 5, y: 0, z: -5 } },
    { id: 'ST-21', zoneId: zoneB.id, name: 'Primer Oven', cycleTimeTarget: 420, bufferCapacity: 2, instr: 'SENSOR_POOR' as const, position: { x: 15, y: 0, z: -5 } },
    { id: 'ST-22', zoneId: zoneB.id, name: 'Top Coat Booth', cycleTimeTarget: 360, bufferCapacity: 2, instr: 'RICH' as const, position: { x: 25, y: 0, z: -5 } },
    { id: 'ST-23', zoneId: zoneB.id, name: 'Clear Coat', cycleTimeTarget: 300, bufferCapacity: 2, instr: 'PARTIAL' as const, position: { x: 35, y: 0, z: -5 } },
    { id: 'ST-24', zoneId: zoneB.id, name: 'Paint Cure Oven', cycleTimeTarget: 480, bufferCapacity: 2, instr: 'RICH' as const, position: { x: 45, y: 0, z: -5 } },

    // Zone C (Final Assembly, ST-25 to ST-40)
    { id: 'ST-25', zoneId: zoneC.id, name: 'Engine Install', cycleTimeTarget: 420, bufferCapacity: 2, instr: 'RICH' as const, position: { x: -45, y: 0, z: 20 } },
    { id: 'ST-26', zoneId: zoneC.id, name: 'Transmission Install', cycleTimeTarget: 360, bufferCapacity: 2, instr: 'RICH' as const, position: { x: -35, y: 0, z: 20 } },
    { id: 'ST-27', zoneId: zoneC.id, name: 'Suspension Front', cycleTimeTarget: 300, bufferCapacity: 2, instr: 'PARTIAL' as const, position: { x: -25, y: 0, z: 20 } },
    { id: 'ST-28', zoneId: zoneC.id, name: 'Suspension Rear', cycleTimeTarget: 280, bufferCapacity: 2, instr: 'MANUAL_ONLY' as const, position: { x: -15, y: 0, z: 20 } },
    { id: 'ST-29', zoneId: zoneC.id, name: 'Brake System Install', cycleTimeTarget: 240, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -5, y: 0, z: 20 } },
    { id: 'ST-30', zoneId: zoneC.id, name: 'Fuel System', cycleTimeTarget: 200, bufferCapacity: 2, instr: 'PARTIAL' as const, position: { x: 5, y: 0, z: 20 } },
    { id: 'ST-31', zoneId: zoneC.id, name: 'Electrical Harness', cycleTimeTarget: 360, bufferCapacity: 2, instr: 'SENSOR_POOR' as const, position: { x: 15, y: 0, z: 20 } },
    { id: 'ST-32', zoneId: zoneC.id, name: 'Dashboard Assembly', cycleTimeTarget: 300, bufferCapacity: 2, instr: 'PARTIAL' as const, position: { x: 25, y: 0, z: 20 } },
    { id: 'ST-33', zoneId: zoneC.id, name: 'Seat Installation', cycleTimeTarget: 240, bufferCapacity: 2, instr: 'MANUAL_ONLY' as const, position: { x: -45, y: 0, z: 30 } },
    { id: 'ST-34', zoneId: zoneC.id, name: 'Glass Install', cycleTimeTarget: 180, bufferCapacity: 2, instr: 'RICH' as const, position: { x: -35, y: 0, z: 30 } },
    { id: 'ST-35', zoneId: zoneC.id, name: 'Wheel Alignment', cycleTimeTarget: 150, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -25, y: 0, z: 30 } },
    { id: 'ST-36', zoneId: zoneC.id, name: 'Fluids Fill', cycleTimeTarget: 120, bufferCapacity: 2, instr: 'PARTIAL' as const, position: { x: -15, y: 0, z: 30 } },
    { id: 'ST-37', zoneId: zoneC.id, name: 'Final Torque Audit', cycleTimeTarget: 90, bufferCapacity: 3, instr: 'RICH' as const, position: { x: -5, y: 0, z: 30 } },
    { id: 'ST-38', zoneId: zoneC.id, name: 'End-of-Line Test', cycleTimeTarget: 300, bufferCapacity: 2, instr: 'RICH' as const, position: { x: 5, y: 0, z: 30 } },
    { id: 'ST-39', zoneId: zoneC.id, name: 'Final Inspection', cycleTimeTarget: 180, bufferCapacity: 4, instr: 'RICH' as const, position: { x: 15, y: 0, z: 30 } },
    { id: 'ST-40', zoneId: zoneC.id, name: 'Shipping/Dispatch', cycleTimeTarget: 60, bufferCapacity: 10, instr: 'SENSOR_POOR' as const, position: { x: 25, y: 0, z: 30 } },
  ];

  let stationIndex = 1;
  for (const st of stationDefs) {
    let stList = await db.select().from(stations).where(eq(stations.externalId, st.id));
    let stationId;
    if (stList.length === 0) {
      const [inserted] = await db.insert(stations).values({
        externalId: st.id,
        zoneId: st.zoneId,
        name: st.name,
        index: stationIndex,
        position: st.position,
        cycleTimeTarget: st.cycleTimeTarget,
        bufferCapacity: st.bufferCapacity,
        instrumentationProfile: st.instr,
      }).returning();
      stationId = inserted.id;
    } else {
      stationId = stList[0].id;
      await db.update(stations).set({
        name: st.name,
        index: stationIndex,
        position: st.position,
        cycleTimeTarget: st.cycleTimeTarget,
        bufferCapacity: st.bufferCapacity,
        instrumentationProfile: st.instr,
      }).where(eq(stations.id, stationId));
    }

    // Equipment and sensors for key stations
    if (['ST-01', 'ST-12', 'ST-18', 'ST-21', 'ST-24'].includes(st.id)) {
      let eqList = await db.select().from(equipment).where(eq(equipment.stationId, stationId));
      let eqId;
      if (eqList.length === 0) {
        let type = 'ROBOT';
        if (st.id === 'ST-12') type = 'TORQUE_WRENCH';
        else if (['ST-18', 'ST-21', 'ST-24'].includes(st.id)) type = 'OVEN';

        const [insertedEq] = await db.insert(equipment).values({
          stationId,
          type,
          model: `Model-${type}-X`,
        }).returning();
        eqId = insertedEq.id;

        // Add sensors
        await db.insert(sensors).values([
          { stationId, equipmentId: eqId, signal: 'temperature', unit: 'C', hasMeasurement: true },
          { stationId, equipmentId: eqId, signal: 'vibration', unit: 'mm/s', hasMeasurement: true },
          { stationId, equipmentId: eqId, signal: 'status', unit: 'state', hasMeasurement: true },
        ]);
        if (type === 'TORQUE_WRENCH') {
          await db.insert(sensors).values([
            { stationId, equipmentId: eqId, signal: 'torque', unit: 'Nm', hasMeasurement: true },
          ]);
        }
      }
    }
    stationIndex++;
  }

  console.log('✅ Seeding completed');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed().then(() => process.exit(0)).catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
