/**
 * AcademiaIQ Database Utility
 * SQLite connection with better-sqlite3
 * Zero-config, works on Render free tier without separate DB server
 *
 * For PostgreSQL support, use src/utils/db-pg.js
 * Set DATABASE_TYPE=postgres environment variable to use PostgreSQL
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/academiaiq.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
