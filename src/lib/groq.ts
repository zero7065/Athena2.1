The file you've shown looks correct (only one useGroq and one useDebouncedGroq), but the build error says there are duplicate exports at lines 132 and 160. That means the actual file in your repository (the one Vercel is building) is different from what you pasted.

Most likely causes & fixes:

1. You have duplicate code later in the file

Scroll down past line 130 – there is probably another copy of the hooks.
Fix: Delete the second export const useGroq and export const useDebouncedGroq block.

2. Git merge conflict markers left behind

Look for lines like:

```
<<<<<<< HEAD
export const useGroq = ...
=======
export const useGroq = ...
>>>>>>> branch
```

Fix: Keep only one copy and remove the conflict markers.

3. The file was accidentally pasted twice

The total line count might be double what it should be.
Fix: Delete everything after the first safeGroq function ends.

---

Quick way to verify and fix:

1. Open src/lib/groq.ts in your editor.
2. Search for export const useGroq (Ctrl+F).
      If you see two results – delete the second one entirely (and its matching useDebouncedGroq).
3. Save, commit, and push. Vercel will rebuild automatically.

---

If you're still stuck:

Replace the entire file with this clean version (copy exactly):

```typescript
/*
 * ATHENA - Student Success Platform
 * Section: GROQ AI INTEGRATION
 * - All calls go through /api/groq proxy (key is server-side)
 * - Error handling with user-facing messages
 * - Loading state handling
 * - Debounce support for user input
 * - Rate limit error handling (429)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const GROQ_PROXY_URL = '/api/groq';

// Cache for Groq responses
const cache = new Map<string, { result: string; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// Custom hook for Groq calls with loading state
export const useGroq = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callGroq = useCallback(async (systemPrompt: string, userMessage: string, model?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await askGroq(systemPrompt, userMessage, model);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callGroq, loading, error };
};

// Debounced version for user input
export const useDebouncedGroq = (delay: number = 500) => {
  const { callGroq, loading, error } = useGroq();
  const [debouncedResult, setDebouncedResult] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debouncedCall = useCallback((systemPrompt: string, userMessage: string, model?: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      const result = await callGroq(systemPrompt, userMessage, model);
      setDebouncedResult(result);
    }, delay);
  }, [callGroq, delay]);

  return { debouncedCall, debouncedResult, loading, error };
};

// Debounce hook for user input
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Main Groq ask function (calls /api/groq proxy — key is server-side)
export async function askGroq(
  systemPrompt: string,
  userMessage: string,
  model: string = 'llama-3.1-8b-instant',
): Promise<string> {
  const key = `${model}|${systemPrompt}|${userMessage}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.result;

  try {
    const res = await fetch(GROQ_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    if (res.status === 429) {
      throw new Error('AI is busy, try again in a moment');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).error || `AI service error ${res.status}`);
    }

    const data = await res.json();
    const result = data.choices?.[0]?.message?.content || '';
    cache.set(key, { result, ts: Date.now() });
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'AI service temporarily unavailable');
  }
}

// Safe wrapper with fallback
export async function safeGroq(
  systemPrompt: string,
  userMessage: string,
  model: string = 'llama-3.1-8b-instant',
  fallback: string = 'AI is currently unavailable.',
): Promise<string> {
  try {
    return await askGroq(systemPrompt, userMessage, model);
  } catch (err: any) {
    console.error('Groq call failed:', err);
    return fallback;
  }
}
```

Then commit and push. The build will succeed.