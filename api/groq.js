/**
 * PLASU Athena — Groq API Proxy
 *
 * Moves the Groq API key server-side so it's never exposed to the browser.
 * Handles art hints, task suggestions, and other auxiliary AI calls.
 * Rate limited: 25 req/min per IP.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const rateLimitStore = new Map();
const RATE_LIMIT = 25;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_WINDOW) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count++;
  rateLimitStore.set(ip, entry);
  return entry.count <= RATE_LIMIT;
}

export default async function handler(req, res) {
  /* CORS */
  const origin = req.headers.origin || '';
  if (origin.includes('vercel.app') || origin.includes('jadai.dev') || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  /* Rate limit */
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    return;
  }

  const { system, message, model = 'llama-3.1-8b-instant' } = req.body || {};
  if (!system || !message) {
    res.status(400).json({ error: 'system and message required' });
    return;
  }

  if (!GROQ_API_KEY) {
    res.status(500).json({ error: 'Groq API not configured.' });
    return;
  }

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const text = await groqRes.text().catch(() => '');
      console.error('Groq error:', groqRes.status, text);
      res.status(502).json({ error: 'AI service error.' });
      return;
    }

    const data = await groqRes.json();
    const result = data.choices?.[0]?.message?.content || '';
    res.json({ result });
  } catch (err) {
    console.error('Groq proxy error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
