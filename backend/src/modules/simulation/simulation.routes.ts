import { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.js';
import { scenarios, simulationResults } from '../../db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { runSimulation, buildSimulationInput } from './simulation.service.js';
import { stations } from '../../db/schema.js';

export async function simulationRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const results = await db.select().from(scenarios).orderBy(desc(scenarios.createdAt)).limit(20);
    return results;
  });

  fastify.post('/', async (request, reply) => {
    const { name, interventions, horizonMinutes, seed } = request.body as any;
    
    // Get all stations for layout order and parameters
    const allStations = await db.select().from(stations).orderBy(stations.index);

    const horizon = horizonMinutes || 480;
    const simInput = buildSimulationInput(
      allStations.map(st => ({
        externalId: st.externalId,
        cycleTimeTarget: st.cycleTimeTarget,
        cycleTimeStd: st.cycleTimeStd || 5,
        bufferCapacity: st.bufferCapacity || 3,
      })),
      interventions || [],
      horizon
    );

    // Overwrite seeds if passed
    if (seed) {
      simInput.seedBaseline = seed;
      simInput.seedScenario = seed;
    }

    const [scenario] = await db.insert(scenarios).values({
      name: name || 'What-If Simulation',
      interventions: interventions || [],
      horizonMinutes: horizon,
      status: 'RUNNING',
      modelVersion: 'sim-des-v1.0',
      baseline: {},
      description: 'User initiated what-if scenario',
    }).returning();

    const results = await runSimulation(simInput);
    
    await db.update(scenarios).set({ status: 'COMPLETED' }).where(eq(scenarios.id, scenario.id));

    const [simResult] = await db.insert(simulationResults).values({
      scenarioId: scenario.id,
      throughput: results.scenario.throughput,
      queueGrowth: results.scenario.stationQueueGrowth,
      utilization: results.scenario.stationUtilization,
      bottleneckProbability: results.scenario.bottleneckProbability,
      qualityImpact: results.scenario.qualityImpact,
      productionLoss: results.scenario.productionLoss,
      recoveryTimeMinutes: results.scenario.recoveryTimeMinutes,
      affectedStations: results.comparison.affectedStations,
      stateClass: 'SIMULATED',
    }).returning();

    return {
      scenario,
      results: simResult,
      comparison: results.comparison
    };
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scenario = await db.query.scenarios.findFirst({
      where: eq(scenarios.id, id),
    });
    if (!scenario) {
      reply.status(404);
      return { error: 'Scenario not found' };
    }
    const results = await db.query.simulationResults.findFirst({
      where: eq(simulationResults.scenarioId, id),
    });
    return { scenario, results };
  });
}
