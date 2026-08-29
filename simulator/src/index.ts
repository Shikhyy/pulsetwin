import { config } from './config';
import { SimulatorEngine } from './production/simulator-engine';
import { startServer } from './server';

console.log(`Config: ${JSON.stringify(config, null, 2)}`);

const engine = new SimulatorEngine();

if (config.DEMO_AUTO_START) {
  engine.start();
}

startServer(engine);

process.on('SIGINT', () => {
  console.log('Shutting down...');
  engine.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  engine.stop();
  process.exit(0);
});
