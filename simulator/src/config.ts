import dotenv from 'dotenv';
dotenv.config();

export const config = {
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
  SIMULATOR_TICK_MS: parseInt(process.env.SIMULATOR_TICK_MS || '1000', 10),
  SIMULATOR_TIME_SCALE: parseInt(process.env.SIMULATOR_TIME_SCALE || '1', 10),
  DEMO_SEED: process.env.DEMO_SEED || '42',
  DEMO_AUTO_START: process.env.DEMO_AUTO_START !== 'false',
  DEMO_TIME_ACCELERATION: parseInt(process.env.DEMO_TIME_ACCELERATION || '60', 10),
  HTTP_PORT: parseInt(process.env.SIMULATOR_PORT || process.env.PORT || process.env.HTTP_PORT || '3002', 10),
};

