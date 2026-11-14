/**
 * AcademiaIQ — University Curriculum API
 *
 * Backend integration endpoint. Connects the app to an external university
 * database via a proxy URL. On the client side (browser-only app) this API
 * runs in localStorage and silently falls back to the proxy when deployed.
 *
 * Security:
 * - CORS limited to trusted origins (unipulse.jadai.dev and Vercel domains)
 * - Rate limiting via Vercel KV: 60 req/min per IP
 * - Input sanitization: strips dangerous characters
 * - Role-based access control for course CRUD
 */

import { kv } from '@vercel/kv';

const PROXY_URL = process.env.UNIVERSITY_API_PROXY || '';
const PROXY_TOKEN = process.env.UNIVERSITY_API_TOKEN || '';
const RATE_LIMIT = 60;
const RATE_WINDOW = 60;

/* =================== Helper functions =================== */

function sanitize(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

function getIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

async function checkRateLimit(ip) {
  const key = `ratelimit:courses:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  const [count, resetTime] = await kv.get(key) ?? [0, now + RATE_WINDOW];
  if (now > resetTime) {
    await kv.set(key, [1, now + RATE_WINDOW], { ex: RATE_WINDOW });
    return { remaining: RATE_LIMIT - 1, limit: RATE_LIMIT, ok: true };
  }
  const newCount = count + 1;
  await kv.set(key, [newCount, resetTime], { ex: Math.max(0, resetTime - now) });
  return { remaining: Math.max(0, RATE_LIMIT - newCount), limit: RATE_LIMIT, ok: newCount <= RATE_LIMIT };
}

async function fetchFromProxy(path, method, body) {
  if (!PROXY_URL) return null;
  const headers = { 'Content-Type': 'application/json' };
  if (PROXY_TOKEN) headers['Authorization'] = `Bearer ${PROXY_TOKEN}`;
  try {
    const res = await fetch(`${PROXY_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function verifyRole(authHeader, requiredRole) {
  if (!authHeader) return false;
  const parts = authHeader.replace(/^Bearer\s+/, '').split(':');
  return parts.length >= 2 && parts[2] === requiredRole;
}

async function writeResponse(res, data, contentType) {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-cache');
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  /* --- CORS & Security Headers --- */
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://unipulse.jadai.dev',
    'https://unipulse2-1.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
  ];
  if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    res.setHeader('Content-Type', 'application/json');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  /* --- Rate Limiting --- */
  const ip = getIP(req);
  const rateInfo = await checkRateLimit(ip);
  res.setHeader('X-RateLimit-Limit', rateInfo.limit);
  res.setHeader('X-RateLimit-Remaining', rateInfo.remaining);
  if (!rateInfo.ok) {
    res.setHeader('Content-Type', 'application/json');
    res.status(429).json({ error: 'Too many requests to the university curriculum API.' });
    return;
  }

  /* --- Role-based auth (from bearer header) --- */
  const authHeader = req.headers['authorization'] || '';
  const isLecturer = verifyRole(authHeader, 'lecturer');
  const isAdmin = verifyRole(authHeader, 'admin');
  const isManagement = verifyRole(authHeader, 'management');
  const canManage = isLecturer || isAdmin || isManagement;

  /* ==================== COURSES ==================== */
  if (req.url.startsWith('/api/courses')) {
    const path = req.url.split('/api/courses')[1] || '';
    const query = new URLSearchParams(path.split('?')[1]);

    if (req.method === 'GET' && !path.includes('enroll')) {
      const external = await fetchFromProxy('/api/courses', 'GET');
      if (external) {
        await writeResponse(res, external, 'application/json');
        return;
      }
      // Local fallback (browser app; data lives in localStorage)
      try {
        const raw = localStorage.getItem('unipulse_courses');
        await writeResponse(res, raw ? JSON.parse(raw) : [], 'application/json');
      } catch {
        await writeResponse(res, [], 'application/json');
      }
      return;
    }

    if (req.method === 'POST' && path.includes('enroll')) {
      const courseId = query.get('courseId');
      const studentEmail = query.get('studentEmail');
      if (!courseId || !studentEmail) {
        await writeResponse(res, { error: 'courseId and studentEmail required' }, 'application/json');
        return;
      }
      const external = await fetchFromProxy('/api/courses/enroll', 'POST', { courseId, studentEmail });
      if (external !== null) {
        await writeResponse(res, external, 'application/json');
        return;
      }
      // Local fallback — enrollment stored in localStorage under unipulse_enrollments
      try {
        const rawEnrollments = localStorage.getItem('unipulse_enrollments') || '[]';
        const all = JSON.parse(rawEnrollments);
        if (!all.some((e) => e.courseId === courseId)) {
          all.push({ courseId, studentEmail, enrolledAt: Date.now() });
        }
        localStorage.setItem('unipulse_enrollments', JSON.stringify(all));
        await writeResponse(res, { enrolled: true, courseId, studentEmail }, 'application/json');
      } catch {
        await writeResponse(res, { error: 'enrollment failed' }, 'application/json');
      }
      return;
    }

    if (req.method === 'POST' && canManage) {
      const body = req.body || {};
      const newCourse = {
        id: `course_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        code: sanitize(body.code),
        title: sanitize(body.title),
        department: sanitize(body.department),
        credits: body.credits || 3,
        yearOfStudy: body.yearOfStudy || 1,
        level: body.level || 1,
        program: sanitize(body.program),
        bio: sanitize(body.bio),
        location: body.location || { campus: 'Main', city: 'Campus', country: 'UNITED STATES' },
        interests: body.interests || [],
        subjects: body.subjects || [],
        skills: body.skills || [],
        joinDate: Date.now(),
      };
      const external = await fetchFromProxy('/api/courses', 'POST', newCourse);
      if (external) {
        await writeResponse(res, external, 'application/json');
        return;
      }
    }
  }

  /* ==================== SYLLABUS ==================== */
  if (req.url.startsWith('/api/syllabus')) {
    const external = await fetchFromProxy('/api/syllabus', 'GET');
    if (external) {
      await writeResponse(res, external, 'application/json');
      return;
    }
    try {
      const raw = localStorage.getItem('unipulse_syllabi');
      await writeResponse(res, raw ? JSON.parse(raw) : [], 'application/json');
    } catch {
      await writeResponse(res, [], 'application/json');
    }
    return;
  }

  /* ==================== ENROLLMENTS ==================== */
  if (req.url.startsWith('/api/enrollments')) {
    const email = req.url.split('email=')[1] || 'student';
    const external = await fetchFromProxy(`/api/enrollments?email=${encodeURIComponent(email)}`, 'GET');
    if (external) {
      await writeResponse(res, external, 'application/json');
      return;
    }
    try {
      const raw = localStorage.getItem('unipulse_enrollments');
      await writeResponse(res, raw ? JSON.parse(raw) : [], 'application/json');
    } catch {
      await writeResponse(res, [], 'application/json');
    }
    return;
  }

  /* ==================== RSS ==================== */
  if (req.url.startsWith('/api/rss')) {
    const url = req.url.split('/api/rss?url=')[1];
    if (!url) {
      await writeResponse(res, { error: 'rss_url required' }, 'application/json');
      return;
    }
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    try {
      const rssRes = await fetch(endpoint);
      if (!rssRes.ok) throw new Error('rss fetch failed');
      const data = await rssRes.json();
      const items = (data.items || []).slice(0, 25).map((i, idx) => ({
        ...i,
        id: `${url}:${idx}`,
      }));
      await writeResponse(res, items, 'application/json');
    } catch {
      await writeResponse(res, [], 'application/json');
    }
    return;
  }

  /* ==================== NOT FOUND ==================== */
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({ error: 'Endpoint not found. Supported: /api/courses, /api/syllabus, /api/enrollments, /api/rss' });
}