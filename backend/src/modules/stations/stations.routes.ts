import { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.js';
import { stations, observations, events, predictions, zones } from '../../db/schema.js';
import { eq, and, desc, inArray, gte, lte } from 'drizzle-orm';
import { getStationState } from './stations.service.js';

export async function stationsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const query = request.query as any;
    
    let dbQuery = db.select({
      id: stations.id,
      name: stations.name,
      index: stations.index,
      zoneId: stations.zoneId,
      instrumentationProfile: stations.instrumentationProfile
    }).from(stations);

    if (query.zoneId) {
      dbQuery = dbQuery.where(eq(stations.zoneId, query.zoneId)) as any;
    } else if (query.lineId) {
      const lineZones = await db.select({ id: zones.id }).from(zones).where(eq(zones.lineId, query.lineId));
      const zoneIds = lineZones.map(z => z.id);
      if(zoneIds.length > 0) {
          dbQuery = dbQuery.where(inArray(stations.zoneId, zoneIds)) as any;
      } else {
          return [];
      }
    }
    
    return await dbQuery.orderBy(stations.index);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await db.select().from(stations).where(eq(stations.id, id)).limit(1);
    if (result.length === 0) return reply.status(404).send({ error: 'Not found' });
    return result[0];
  });

  fastify.get('/:id/state', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const state = await getStationState(id);
      return state;
    } catch (e: any) {
      return reply.status(404).send({ error: e.message });
    }
  });

  fastify.get('/:id/telemetry', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { signal, limit = 100, from, to } = request.query as any;
    
    let conditions = [eq(observations.entityId, id)];
    if (signal) conditions.push(eq(observations.signal, signal));
    if (from) conditions.push(gte(observations.timestamp, new Date(from)));
    if (to) conditions.push(lte(observations.timestamp, new Date(to)));
    
    const results = await db.select()
      .from(observations)
      .where(and(...conditions))
      .orderBy(desc(observations.timestamp))
      .limit(Number(limit));
    return results;
  });

  fastify.get('/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string };
    const results = await db.select().from(events)
      .where(eq(events.entityId, id))
      .orderBy(desc(events.timestamp))
      .limit(50);
    return results;
  });

  fastify.get('/:id/predictions', async (request, reply) => {
    const { id } = request.params as { id: string };
    const results = await db.select().from(predictions)
      .where(eq(predictions.entityId, id))
      .orderBy(desc(predictions.timestamp))
      .limit(20);
    return results;
  });
}
