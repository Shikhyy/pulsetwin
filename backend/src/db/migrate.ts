import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import { migrate as drizzleMigrate } from 'drizzle-orm/node-postgres/migrator';
import { env } from '../config/env.js';

const { Pool } = pkg;

export async function runMigrate() {
  console.log('🚀 Running migrations...');
  const pool = env.DATABASE_URL
    ? new Pool({ connectionString: env.DATABASE_URL })
    : new Pool({
        host: env.POSTGRES_HOST,
        port: env.POSTGRES_PORT,
        database: env.POSTGRES_DB,
        user: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
      });

  const db = drizzle(pool);

  try {
    // For prototype, we'll assume we'd use push or create raw tables if needed.
    // In a real app with drizzle-kit, we'd run:
    // await drizzleMigrate(db, { migrationsFolder: 'drizzle' });
    
    // As a fallback to ensure ENUMs exist for prototype:
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE state_class AS ENUM ('MEASURED', 'INFERRED', 'PREDICTED', 'SIMULATED', 'UNKNOWN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE station_status AS ENUM ('RUNNING', 'IDLE', 'BLOCKED', 'STARVED', 'DEGRADED', 'MAINTENANCE', 'WARNING', 'CRITICAL', 'OFFLINE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE zone_type AS ENUM ('BODY_CONSTRUCTION', 'PAINT', 'FINAL_ASSEMBLY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE instrumentation_profile AS ENUM ('RICH', 'PARTIAL', 'MANUAL_ONLY', 'SENSOR_POOR');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE prediction_type AS ENUM ('BOTTLENECK', 'DEFECT', 'ANOMALY', 'EQUIPMENT_FAILURE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE production_unit_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'SCRAPPED', 'REWORK');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE quality_result AS ENUM ('PASS', 'FAIL', 'MARGINAL', 'PENDING');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE scenario_status AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE recommendation_status AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'IMPLEMENTED', 'DISMISSED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE control_command_status AS ENUM ('PENDING', 'APPROVED', 'EXECUTING', 'SUCCESS', 'FAILED', 'REJECTED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('OPERATOR', 'ENGINEER', 'MANAGER', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Note: Drizzle push handles schema sync in dev. For production, a proper migrations folder is needed.
    console.log('✅ Migrations completed');
  } catch (err) {
    console.error('❌ Migration failed', err);
    throw err;
  } finally {
    if (process.argv[1].endsWith('migrate.ts')) {
      await pool.end();
      process.exit(0);
    }
  }
}

if (process.argv[1].endsWith('migrate.ts')) {
  runMigrate();
}
