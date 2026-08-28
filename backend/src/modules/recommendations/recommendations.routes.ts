import { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.js';
import { recommendations, controlCommands, predictions } from '../../db/schema.js';
import { desc, eq, and } from 'drizzle-orm';

export async function recommendationsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const { active, stationId } = request.query as any;
    let query = db.select().from(recommendations);
    
    const conditions = [];
    if (active === 'true') conditions.push(eq(recommendations.status, 'ACTIVE'));
    // If we wanted to join predictions for stationId, we would do it here. 
    // Keeping simple for prototype.
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(recommendations.createdAt)).limit(20);
  });

  fastify.post('/', async (request, reply) => {
    const { predictionId, simulationDelta } = request.body as any;
    
    let predList = await db.select().from(predictions).where(eq(predictions.id, predictionId)).limit(1);
    if (predList.length === 0) return reply.status(404).send({ error: 'Prediction not found' });
    const pred = predList[0];

    const actionText = pred.type === 'BOTTLENECK' 
      ? `Adjust cycle time or add capacity at ${pred.entityId}`
      : `Perform maintenance on ${pred.entityId}`;

    const [rec] = await db.insert(recommendations).values({
      predictionId,
      action: actionText,
      expectedImpact: simulationDelta || {},
      confidence: 0.85,
      status: 'ACTIVE'
    }).returning();

    return rec;
  });

  fastify.post('/:id/execute', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const firstUser = await db.query.users.findFirst();
    const userId = firstUser?.id || crypto.randomUUID();

    const [command] = await db.insert(controlCommands).values({
      recommendationId: id,
      target: 'ST-18', // Mock target
      parameter: 'speed',
      requestedValue: 0.8,
      requestedBy: userId,
      status: 'SUCCESS', // Mock immediate execution
      executedAt: new Date(),
      result: 'Success'
    }).returning();

    await db.update(recommendations).set({ status: 'IMPLEMENTED' }).where(eq(recommendations.id, id));
    return command;
  });
}
