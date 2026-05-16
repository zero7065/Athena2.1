/*
 * ATHENA - Student Success Platform
 * Section: AI CHAT — Groq via Serverless Proxy
 *
 * - Calls /api/groq proxy (key is server-side, never exposed)
 * - Uses llama-3.1-70b-versatile model (mixtral deprecated)
 * - Shows error messages if proxy fails
 * - Maintains chat history in localStorage
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Loader2, Copy, Check, Download, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

const GROQ_PROXY_URL = '/api/groq';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  failed?: boolean;
  feedback?: 'up' | 'down' | null;
}

const STORAGE_KEY = 'athena_chat_history';

function loadHistory(): ChatMsg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveHistory(msgs: ChatMsg[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100))); } catch { /* quota */ }
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function exportChat(msgs: ChatMsg[]) {
  const lines = msgs.map(m =>
    `[${formatTime(m.timestamp)}] ${m.role === 'user' ? 'You' : 'PLASU Athena'}:\n${m.text}\n`
  );
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `athena_chat_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMsg[]>(loadHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingId]);

  const clearChat = () => {
    if (messages.length === 0) return;
    if (!window.confirm('Clear entire conversation?')) return;
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Send message to Groq via serverless proxy
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const aiId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, userMsg]);
    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    const aiMsg: ChatMsg = {
      id: aiId,
      role: 'assistant',
      text: '',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMsg]);

    const chatHistory = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));
    chatHistory.push({ role: 'user', content: userText });

    try {
      const res = await fetch(GROQ_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: 'You are PLASU Athena, an academic assistant for Plateau State University. Answer questions helpfully, concisely, and stay on academic topics.' },
            ...chatHistory.slice(-20),
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (res.status === 429) {
        throw new Error('AI is busy, try again in a moment');
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const errMsg = (errBody as any)?.error || `AI service error (${res.status})`;
        throw new Error(errMsg);
      }

      const data = await res.json();
      const responseText = data.choices?.[0]?.message?.content || 'No response from AI.';
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: responseText } : m));
    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === aiId ? {
        ...m,
        text: `❌ Error: ${err.message || 'AI service unavailable. Please check your Groq API key configuration.'}`,
        failed: true,
      } : m));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const retryMessage = useCallback(async (failedMsgId: string) => {
    const idx = messages.findIndex(m => m.id === failedMsgId);
    if (idx < 1 || messages[idx - 1].role !== 'user') return;

    const userMsg = messages[idx - 1];
    setMessages(prev => prev.filter(m => m.id !== failedMsgId));
    setInput(userMsg.text);
  }, [messages]);

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* fallback */ }
  };

  const giveFeedback = (msgId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const newRating = m.feedback === rating ? null : rating;
      console.log('Feedback:', { messageId: msgId, rating: newRating, timestamp: new Date().toISOString() });
      return { ...m, feedback: newRating };
    }));
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 h-full flex flex-col max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#00843D] text-white shadow-lg">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              PLASU <span className="text-[#00843D]">Athena</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Your Academic AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={() => exportChat(messages)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs font-bold text-slate-500 hover:text-primary hover:border-primary transition-all min-h-[44px]">
              <Download size={14} /> Export
            </button>
          )}
          <button onClick={clearChat}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </header>

      <div className="flex-1 glass rounded-[24px] sm:rounded-[40px] flex flex-col overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-2xl" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 opacity-60">
              <div className="p-5 rounded-full bg-[#00843D]/10">
                <Sparkles size={40} className="text-[#00843D]" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">How can I help you today?</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Ask about your courses, study tips, or PLASU life.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
                {[
                  'Explain Binary Search Trees',
                  'Study tips for CSC 301',
                  'PLASU library hours',
                  'How to improve focus?',
                ].map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-[#00843D] hover:text-[#00843D] transition-all text-left min-h-[44px]">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={m.id} className={cn('flex gap-3 max-w-[90%] sm:max-w-[80%]', m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                <div className={cn('w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-sm',
                  m.role === 'user' ? 'bg-[#00843D] text-white' : 'bg-white dark:bg-slate-800 text-[#00843D] border border-slate-200 dark:border-slate-700')}>
                  {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn('p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-sm leading-relaxed shadow-sm',
                    m.role === 'user' ? 'bg-[#00843D] text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none',
                    m.failed && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800')}>
                    {/* Model indicator tag */}
                    {m.role === 'assistant' && !m.failed && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                          <Sparkles size={10} />
                          Groq
                        </span>
                      </div>
                    )}
                    {m.role === 'assistant' && streamingId === m.id && !m.failed ? (
                      <span>{m.text}<span className="inline-block w-2 h-4 bg-[#00843D] dark:bg-[#00843D] ml-0.5 animate-pulse" /></span>
                    ) : (
                      <div className="markdown-body"><Markdown>{m.text || (streamingId === m.id ? '' : '...')}</Markdown></div>
                    )}
                    <div className={cn('flex items-center justify-between mt-1.5', m.role === 'user' ? 'flex-row-reverse' : '')}>
                      <span className={cn('text-[10px] font-bold uppercase tracking-widest', m.role === 'user' ? 'text-white/60' : 'text-slate-400')}>
                        {formatTime(m.timestamp)}
                      </span>
                      {m.role === 'assistant' && !m.failed && m.text && streamingId !== m.id && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => copyText(m.text, m.id)}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Copy response">
                            {copiedId === m.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
                          </button>
                          <button onClick={() => giveFeedback(m.id, 'up')}
                            className={cn('p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors', m.feedback === 'up' ? 'text-emerald-500' : 'text-slate-400')} title="Helpful">
                            <ThumbsUp size={12} />
                          </button>
                          <button onClick={() => giveFeedback(m.id, 'down')}
                            className={cn('p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors', m.feedback === 'down' ? 'text-red-500' : 'text-slate-400')} title="Not helpful">
                            <ThumbsDown size={12} />
                          </button>
                        </div>
                      )}
                      {m.failed && (
                        <button onClick={() => retryMessage(m.id)}
                          className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors">
                          <RotateCcw size={12} /> Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && streamingId === null && (
            <div className="flex gap-3 mr-auto">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-800 text-[#00843D] border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={18} />
              </div>
              <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span className="text-xs font-medium text-slate-500 ml-1">PLASU Athena is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-5 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 safe-area-bottom">
          <div className="relative flex items-center gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask me anything academic..."
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 outline-none focus:ring-2 focus:ring-[#00843D]/30 transition-all text-sm sm:text-base shadow-inner"
              autoComplete="off" />
            <button onClick={handleSend} disabled={!input.trim() || isLoading}
              className="p-3 bg-[#00843D] text-white rounded-2xl sm:rounded-3xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-[#00843D]/20 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2 font-medium leading-relaxed px-2">
            PLASU Athena is an AI tool &mdash; always verify important information with your lecturer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;