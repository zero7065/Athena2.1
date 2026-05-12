/* Groq AI integration — for art hints, task suggestions, and other non-chat features */
/* The main chat uses /api/chat proxy with Gemini; Groq is used for auxiliary AI calls */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const cache = new Map<string, { result: string; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

let requestTimestamps: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(t => now - t < 60000);
  if (requestTimestamps.length >= 25) return false;
  requestTimestamps.push(now);
  return true;
}

export async function askGroq(
  systemPrompt: string,
  userMessage: string,
  model: string = 'llama-3.1-8b-instant',
): Promise<string> {
  const key = `${model}|${systemPrompt}|${userMessage}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.result;

  if (!checkRateLimit()) throw new Error('Rate limit approached.');

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Groq error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const result = data.choices?.[0]?.message?.content || '';
  cache.set(key, { result, ts: Date.now() });
  return result;
}

export async function safeGroq(
  systemPrompt: string,
  userMessage: string,
  model: string = 'llama-3.1-8b-instant',
  fallback: string = 'AI is currently unavailable.',
): Promise<string> {
  try {
    return await askGroq(systemPrompt, userMessage, model);
  } catch (err) {
    console.error('Groq call failed:', err);
    return fallback;
  }
}
