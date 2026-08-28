import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'pulsetwin',
    user: process.env.POSTGRES_USER ?? 'pulsetwin',
    password: process.env.POSTGRES_PASSWORD ?? 'changeme_dev_only',
  },
} satisfies Config;
