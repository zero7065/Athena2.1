/**
 * AcademiaIQ PostgreSQL Database Module
 * PostgreSQL connection pool for production deployments
 * SQLite is used for local development, PostgreSQL for production
 */

import { Pool } from 'pg';

const pgPool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'academiaiq',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  max: parseInt(process.env.PGMAX || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pgPool.connect()
  .then(() => console.log('✅ PostgreSQL connected successfully'))
  .catch((err) => console.error('❌ PostgreSQL connection failed:', err.message));

export default pgPool;
