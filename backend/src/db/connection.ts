import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import { env } from '../config/env.js';
import * as schema from './schema.js';

const { Pool } = pkg;

export const pool = env.DATABASE_URL
  ? new Pool({ connectionString: env.DATABASE_URL })
  : new Pool({
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
      database: env.POSTGRES_DB,
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
    });

export const db = drizzle(pool, { schema });

export async function checkConnection() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('✅ Database connection established');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed', err);
    return false;
  }
}
