import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  BACKEND_PORT: z.coerce.number().default(process.env.PORT ? parseInt(process.env.PORT) : 3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default('pulsetwin'),
  POSTGRES_USER: z.string().default('pulsetwin'),
  POSTGRES_PASSWORD: z.string().default('changeme_dev_only'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default('super-secret-jwt-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  ML_SERVICE_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  DEMO_SEED: z.coerce.number().default(42),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
