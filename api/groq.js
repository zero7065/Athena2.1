/**
 * ATHENA — Groq API Proxy
 *
 * Security:
 * - GROQ_API_KEY is server-side only (never exposed to client)
 * - Accepts POST with { model, messages, ... }
 * - Forwards request to Groq API with server-side key
 * - Rate limited: 25 req/min per IP
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const RATE_LIMIT = 25;
const RATE_WINDOW = 60_000;
const rateStore = new Map();

function checkRate(ip) {
  const now = Date.now();
  const entry = rateStore.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateStore.set(ip, entry);
  return entry.count <= RATE_LIMIT;
}

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '';
  if (origin.includes('vercel.app') || origin.includes('jadai.dev') || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  // Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (!checkRate(ip)) {
    res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    return;
  }

  if (!GROQ_API_KEY) {
    res.status(500).json({ error: 'Groq API key not configured on server.' });
    return;
  }

  try {
    const { model, messages, ...rest } = req.body || {};
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'mixtral-8x7b-32768',
        messages: messages || [],
        ...rest,
      }),
    });

    const data = await groqRes.json();
    res.status(groqRes.status).json(data);
  } catch (err) {
    console.error('Groq proxy error:', err);
    res.status(500).json({ error: 'Groq proxy failed.' });
  }
}