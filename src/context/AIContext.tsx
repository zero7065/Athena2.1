/*
 * AcademiaIQ - AI Context Provider
 * Global AI assistant accessible from anywhere in the app.
 * Powers the floating AI button and sidebar chat.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  feedback?: 'up' | 'down' | null;
}

interface AIContextType {
  messages: AIMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
  isLoading: boolean;
  isOpen: boolean;
  toggle: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const aiId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiId, role: 'assistant', content: '', timestamp: new Date().toISOString() }]);

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are AcademiaIQ, an AI academic assistant integrated throughout the AcademiaIQ platform. You help students with tasks, study planning, course information, focus tips, and general academic questions. Be concise, helpful, and academic-focused.' },
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text.trim() },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error('AI service unavailable');
      const data = await res.json();
      const responseText = data.choices?.[0]?.message?.content || 'I am here to help with your academic journey.';
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: responseText } : m));
    } catch {
      const fallback = "I'm your AcademiaIQ AI assistant. I'm temporarily offline, but I can still help you navigate the app. Try asking about tasks, study plans, courses, or focus tips.";
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fallback } : m));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return (
    <AIContext.Provider value={{ messages, setMessages, isLoading, isOpen, toggle, sendMessage, clearMessages }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) throw new Error('useAI must be used within AIProvider');
  return context;
};
