import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { env } from './config/env.js';
import { wsManager } from './realtime/websocket-manager.js';
import { checkConnection } from './db/connection.js';
import { runMigrate } from './db/migrate.js';
import { predictionEngine } from './services/prediction-engine.js';

// Route imports
import { authRoutes } from './modules/auth/auth.routes.js';
import { plantsRoutes } from './modules/plants/plants.routes.js';
import { stationsRoutes } from './modules/stations/stations.routes.js';
import { productionRoutes } from './modules/production/production.routes.js';
import { predictionsRoutes } from './modules/predictions/predictions.routes.js';
import { simulationRoutes } from './modules/simulation/simulation.routes.js';
import { recommendationsRoutes } from './modules/recommendations/recommendations.routes.js';
import { demoRoutes } from './modules/demo/demo.routes.js';

const fastify = Fastify({ logger: true });

async function buildServer() {
  await fastify.register(cors, { origin: '*' });
  await fastify.register(helmet);
  await fastify.register(jwt, { secret: env.JWT_SECRET });
  await fastify.register(websocket);

  fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
      wsManager.addClient(connection.socket);
    });
  });

  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(plantsRoutes, { prefix: '/api/plants' });
  fastify.register(stationsRoutes, { prefix: '/api/stations' });
  fastify.register(productionRoutes, { prefix: '/api/production-units' });
  fastify.register(predictionsRoutes, { prefix: '/api/predictions' });
  fastify.register(simulationRoutes, { prefix: '/api/simulations' });
  fastify.register(recommendationsRoutes, { prefix: '/api/recommendations' });
  fastify.register(demoRoutes, { prefix: '/api/demo' });

  return fastify;
}

const start = async () => {
  try {
    try {
      await runMigrate();
      const dbOk = await checkConnection();
      if (!dbOk) {
        console.warn('DB connection check failed, continuing anyway...');
      }
    } catch (dbErr) {
      console.warn('Database not available, running in stateless/websocket-only mode:', (dbErr as Error).message);
    }

    predictionEngine.start();

    const server = await buildServer();
    const port = env.BACKEND_PORT;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server listening on port ${port}`);

    const gracefulShutdown = async () => {
      console.log('Shutting down...');
      predictionEngine.stop();
      await server.close();
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
