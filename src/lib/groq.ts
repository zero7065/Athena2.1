/**
 * ATHENA - Groq API Integration
 * Custom React hooks for AI chat with the Groq API via serverless proxy
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Main hook for calling Groq API via /api/groq serverless proxy
 */
export const useGroq = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = true; // Server-side key, always configured

  const callGroq = useCallback(async (messages: GroqMessage[]): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to call Groq API';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callGroq, loading, error, isConfigured };
};

/**
 * Debounced version for user input (prevents rapid API calls)
 */
export const useDebouncedGroq = (delay: number = 500) => {
  const { callGroq, loading, error, isConfigured } = useGroq();
  const [debouncedResult, setDebouncedResult] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCall = useCallback(
    (messages: GroqMessage[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        const result = await callGroq(messages);
        setDebouncedResult(result);
      }, delay);
    },
    [callGroq, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedCall, debouncedResult, loading, error, isConfigured };
};

/**
 * Utility: Safe Groq call with error handling
 */
export const safeGroq = async (
  messages: GroqMessage[],
  onError?: (error: string) => void
): Promise<string | null> => {
  try {
    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMsg = err.error || `HTTP ${response.status}`;
      onError?.(errorMsg);
      return null;
    }

    const data: GroqResponse = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err: any) {
    const errorMsg = err.message || 'Failed to call Groq API';
    onError?.(errorMsg);
    return null;
  }
};