import { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.js';
import { predictions } from '../../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { predictionEngine } from '../../services/prediction-engine.js';

export async function predictionsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const { stationId, type, active, limit = 50 } = request.query as any;
    
    let query = db.select().from(predictions);
    const conditions = [];
    if (stationId) conditions.push(eq(predictions.entityId, stationId));
    if (type) conditions.push(eq(predictions.type, type));
    // active flag could filter by timestamp or resolved status in a real app
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(predictions.timestamp)).limit(Number(limit));
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await db.select().from(predictions).where(eq(predictions.id, id)).limit(1);
    if (result.length === 0) return reply.status(404).send({ error: 'Not found' });
    return result[0];
  });

  fastify.post('/evaluate', async (request, reply) => {
    await predictionEngine.runEvaluationLoop();
    return { success: true, message: 'Evaluation loop triggered' };
  });
}
