/**
 * AcademiaIQ — Database Initialization (CLI)
 * Usage: npm run init-db
 */

import { ensureSchema } from '../src/utils/schema.js';
import db from '../src/utils/db.js';

ensureSchema();
console.log('Database initialized (seed data applied where missing).');
db.close();
