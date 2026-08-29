import express from 'express';
import { config } from './config';
import { SimulatorEngine } from './production/simulator-engine';

export function startServer(engine: SimulatorEngine) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  app.post('/demo/trigger', (req, res) => {
    engine.triggerScenario();
    res.json({ success: true, message: 'Scenario triggered' });
  });

  app.post('/demo/reset', (req, res) => {
    // Implement full reset if needed, for now just restart process or engine
    res.json({ success: true, message: 'Not fully implemented. Restart container for clean reset.' });
  });

  app.post('/demo/accelerate', (req, res) => {
    const scale = req.body.scale;
    if (typeof scale === 'number' && scale > 0) {
      engine.setTimeAcceleration(scale);
      res.json({ success: true, scale });
    } else {
      res.status(400).json({ error: 'Invalid scale parameter' });
    }
  });

  app.listen(config.HTTP_PORT, () => {
    console.log(`[Server] HTTP API listening on port ${config.HTTP_PORT}`);
  });
}

