/* Groq AI integration — all calls go through /api/groq proxy (key is server-side) */

const cache = new Map<string, { result: string; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function askGroq(
  systemPrompt: string,
  userMessage: string,
  model: string = 'llama-3.1-8b-instant',
): Promise<string> {
  const key = `${model}|${systemPrompt}|${userMessage}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.result;

  const res = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: systemPrompt,
      message: userMessage,
      model,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `Groq proxy error ${res.status}`);
  }

  const data = await res.json();
  const result = data.result || '';
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
