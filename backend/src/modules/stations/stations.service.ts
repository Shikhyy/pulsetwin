import { db } from '../../db/connection.js';
import { stations, observations, productionUnits, events } from '../../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';

export async function getStationState(stationId: string) {
  const stationList = await db.select().from(stations).where(eq(stations.id, stationId)).limit(1);
  if (stationList.length === 0) throw new Error('Station not found');
  const station = stationList[0];

  // Latest cycle time
  const ctObs = await db.select().from(observations)
    .where(and(eq(observations.entityId, stationId), eq(observations.signal, 'cycle_time')))
    .orderBy(desc(observations.timestamp))
    .limit(1);
  
  // Queue length
  const queueUnits = await db.select().from(productionUnits).where(eq(productionUnits.currentStationId, stationId));
  
  // Utilization (from recent)
  const utilObs = await db.select().from(observations)
    .where(and(eq(observations.entityId, stationId), eq(observations.signal, 'utilization')))
    .orderBy(desc(observations.timestamp))
    .limit(1);

  // Health/Status (Inferred or from events)
  const recentEvents = await db.select().from(events)
    .where(eq(events.entityId, stationId))
    .orderBy(desc(events.timestamp))
    .limit(1);

  let status = 'IDLE';
  if (recentEvents.length > 0) {
    if (recentEvents[0].type === 'FAILURE') status = 'DOWN';
    else if (recentEvents[0].type === 'BLOCKAGE') status = 'BLOCKED';
    else if (recentEvents[0].type === 'STARVATION') status = 'STARVED';
    else status = 'RUNNING';
  } else {
    status = queueUnits.length > 0 ? 'RUNNING' : 'IDLE';
  }

  let stateClass = (station.instrumentationProfile === 'SENSOR_POOR' || station.instrumentationProfile === 'MANUAL_ONLY') ? 'INFERRED' : 'MEASURED';

  return {
    stationId,
    timestamp: new Date().toISOString(),
    status,
    utilization: utilObs.length > 0 ? utilObs[0].value : 0,
    currentCycleTime: ctObs.length > 0 ? ctObs[0].value : (station.cycleTimeTarget || 60),
    queueLength: queueUnits.length,
    stateClass,
    alerts: recentEvents.map(e => e.type)
  };
}

export async function getAllStationStates(lineId?: string) {
  // Mocking list retrieval
  const sts = await db.select().from(stations);
  const states = [];
  for (const st of sts) {
    states.push(await getStationState(st.id));
  }
  return states;
}
