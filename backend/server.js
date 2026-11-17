/**
 * AcademiaIQ Backend Server
 * Express + SQLite API for the AcademiaIQ platform
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import authRoutes from './src/routes/auth.js';
import taskRoutes from './src/routes/tasks.js';
import skillRoutes from './src/routes/skills.js';
import submissionRoutes from './src/routes/submissions.js';
import courseRoutes from './src/routes/courses.js';
import rssRoutes from './src/routes/rss.js';
import { ensureSchema } from './src/utils/schema.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS_ORIGIN accepts a comma-separated list, e.g.
//   http://localhost:5173,https://yourapp.vercel.app
const rawOrigins = (process.env.CORS_ORIGIN || '*').trim();
const allowedOrigins = rawOrigins === '*'
  ? '*'
  : rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (also used as a Render keep-alive ping)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'academiaiq-backend',
    database: process.env.DATABASE_TYPE === 'postgres' ? 'postgres' : 'sqlite',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({ name: 'AcademiaIQ API', docs: '/api/health', routes: ['/api/auth', '/api/tasks', '/api/skills', '/api/submissions', '/api/courses', '/api/rss'] });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/rss', rssRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Ensure database schema exists on every boot (idempotent).
// Render free tier has an ephemeral disk, so this runs each start.
try {
  ensureSchema();
} catch (err) {
  console.error('Schema initialization failed:', err.message);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AcademiaIQ Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
});
