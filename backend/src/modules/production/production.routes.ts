import { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.js';
import { productionUnits, qualityObservations, stations, events, observations } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export async function productionRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const { lineId, limit = 50, status } = request.query as any;
    let query = db.select().from(productionUnits);
    if (lineId) query = query.where(eq(productionUnits.lineId, lineId)) as any;
    if (status) query = query.where(eq(productionUnits.status, status)) as any;
    
    return await query.orderBy(desc(productionUnits.enteredLineAt)).limit(Number(limit));
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await db.select().from(productionUnits).where(eq(productionUnits.id, id)).limit(1);
    if (result.length === 0) return reply.status(404).send({ error: 'Not found' });
    return result[0];
  });

  fastify.get('/:id/journey', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await db.select().from(productionUnits).where(eq(productionUnits.id, id)).limit(1);
    if (result.length === 0) return reply.status(404).send({ error: 'Not found' });
    
    // Construct journey from events and quality obs (mock digital thread)
    // In reality, this requires a history table. Using stations list as mock journey
    const allStations = await db.select().from(stations).orderBy(stations.index);
    const qual = await db.select().from(qualityObservations).where(eq(qualityObservations.productionUnitId, id));
    
    const journey = allStations.map(st => {
      const qs = qual.filter(q => q.stationId === st.id);
      return {
        stationId: st.id,
        stationName: st.name,
        enteredAt: new Date(Date.now() - 3600000).toISOString(), // Mock timestamp
        exitedAt: new Date(Date.now() - 3500000).toISOString(),
        cycleTime: st.cycleTimeTarget,
        status: qs.some(q => q.result === 'FAIL') ? 'WARNING' : 'PASS',
        events: [],
        observations: [],
        qualityChecks: qs
      };
    });

    return {
      unit: result[0],
      journey
    };
  });

  fastify.get('/:id/quality', async (request, reply) => {
    const { id } = request.params as { id: string };
    return await db.select({
      id: qualityObservations.id,
      characteristic: qualityObservations.characteristic,
      result: qualityObservations.result,
      value: qualityObservations.value,
      timestamp: qualityObservations.timestamp,
      stationName: stations.name
    })
    .from(qualityObservations)
    .leftJoin(stations, eq(qualityObservations.stationId, stations.id))
    .where(eq(qualityObservations.productionUnitId, id))
    .orderBy(desc(qualityObservations.timestamp));
  });
}
