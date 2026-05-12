import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { ChatMessage } from '../types';
import Markdown from 'react-markdown';
import { safeGroq } from '../lib/groq';

const AIChatbot: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const systemInstruction = `You are ATHENA, the AI Academic Assistant for Plateau State University (PLASU), Bokkos. Your goal is to help students with their academic questions, study strategies, and university-related inquiries.

Context about the user:
- Name: ${user?.name || 'Student'}
- Department: ${user?.department || 'General'}
- Year: ${user?.year_of_study || 'N/A'}
- Personality Preference: ${user?.ai_personality || 'charming'}

Available Course Materials (Mock Context):
1. Introduction to Algorithms (CSC 301)
2. Data Structures & Logic (CSC 202)
3. Advanced Database Systems (CSC 405)

Guidelines:
- Be professional, encouraging, and helpful.
- If the user's personality preference is 'strict', be direct and focused on discipline.
- If 'charming', be warm and supportive.
- If 'sarcastic', use dry wit but stay helpful.
- If 'zen', be calm and philosophical.
- Always prioritize academic integrity. Do not solve full assignments, but explain concepts.
- Mention PLASU values when appropriate.`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const answer = await safeGroq(
      systemInstruction,
      input,
      'llama-3.3-70b-versatile',
      "I'm sorry, I couldn't process that request. Please try again later.",
    );

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: answer,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  }, [input, isLoading, systemInstruction]);

  const clearChat = () => setMessages([]);

  return (
    <div className="p-4 sm:p-8 space-y-6 h-full flex flex-col max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
            <Bot size={32} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              ATHENA AI <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">Academic Assistant</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">Your personalized PLASU study companion.</p>
          </div>
        </div>
        <button onClick={clearChat}
          className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-wider min-h-[44px]">
          <Trash2 size={18} /> Clear Chat
        </button>
      </header>

      <div className="flex-1 glass rounded-[32px] sm:rounded-[40px] flex flex-col overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
              <div className="p-6 rounded-full bg-slate-50 dark:bg-slate-800">
                <Sparkles size={48} className="text-primary animate-pulse" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">How can I help you today?</h3>
                <p className="text-sm text-slate-500 mt-2">Ask me about your courses, study tips, or university life at PLASU.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                {[
                  'Explain Binary Search Trees',
                  'Study tips for CSC 301',
                  'PLASU library hours',
                  'How to improve focus?',
                ].map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all text-left min-h-[44px]">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id}
                className={cn('flex gap-4 max-w-[85%] sm:max-w-[75%]', m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                <div className={cn('w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                  m.role === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-primary border border-slate-100 dark:border-slate-700')}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={cn('p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-sm sm:text-base leading-relaxed shadow-sm',
                  m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none')}>
                  <div className="markdown-body"><Markdown>{m.text}</Markdown></div>
                  <span className={cn('text-[10px] mt-2 block opacity-50 font-bold uppercase tracking-widest',
                    m.role === 'user' ? 'text-white/70' : 'text-slate-400')}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4 mr-auto">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-800 text-primary border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={20} />
              </div>
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none flex items-center gap-3">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span className="text-sm font-medium text-slate-500">ATHENA is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex items-center gap-3">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ask me anything academic..."
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl px-6 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-primary transition-all text-sm sm:text-base shadow-inner" />
            <button onClick={handleSend} disabled={!input.trim() || isLoading}
              className="p-3 sm:p-4 bg-primary text-white rounded-2xl sm:rounded-3xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
            Powered by Groq Llama 3 &bull; ATHENA Academic Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
