/*
 * ATHENA - Student Success Platform
 * Section: GROQ AI INTEGRATION
 * - Uses VITE_GROQ_API_KEY from import.meta.env
 * - Added error handling with user-facing messages
 * - Added loading state handling
 * - Added debounce support for user input
 * - Added rate limit error handling (429)
 * - Added banner when API key is missing
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Cache for Groq responses
const cache = new Map<string, { result: string; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// Hook to check if API key is configured
export const useGroqKey = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(!!GROQ_API_KEY);
  return isConfigured;
};

// Banner component for missing API key
export const GroqUnavailableBanner = () => {
  const isConfigured = useGroqKey();
  if (isConfigured) return null;
  return (
    <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium">
      AI features unavailable — API key not configured
    </div>
  );
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

// Main Groq ask function
export async function askGroq(
  systemPrompt: string,
  userMessage: string,
  model: string = 'llama-3.1-8b-instant',
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('AI features unavailable — API key not configured');
  }

  const key = `${model}|${systemPrompt}|${userMessage}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.result;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
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
    if (error.message.includes('API key not configured')) {
      throw error;
    }
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

// Custom hook for Groq calls with loading state
export const useGroq = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = useGroqKey();

  const callGroq = useCallback(async (systemPrompt: string, userMessage: string, model?: string) => {
    if (!isConfigured) {
      setError('AI features unavailable — API key not configured');
      return null;
    }

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
  }, [isConfigured]);

  return { callGroq, loading, error, isConfigured };
};

// Debounced version for user input
export const useDebouncedGroq = (delay: number = 500) => {
  const { callGroq, loading, error, isConfigured } = useGroq();
  const [debouncedResult, setDebouncedResult] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const debouncedCall = useCallback((systemPrompt: string, userMessage: string, model?: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      const result = await callGroq(systemPrompt, userMessage, model);
      setDebouncedResult(result);
    }, delay);
  }, [callGroq, delay]);

  return { debouncedCall, debouncedResult, loading, error, isConfigured };
};