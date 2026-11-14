/*
 * AcademiaIQ - AI Chat Sidebar
 * Expandable AI assistant panel that slides in from the right.
 * Integrated with global AI context for cross-page conversations.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Bot, User, Sparkles, X, Send, Trash2, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAI } from '../context/AIContext';

const AIChatSidebar: React.FC = () => {
  const { messages, setMessages, isLoading, isOpen, toggle, sendMessage, clearMessages } = useAI();
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    await sendMessage(input);
    setInput('');
  }, [input, isLoading, sendMessage]);

  const copyText = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* noop */ }
  }, []);

  const giveFeedback = useCallback((msgId: string, rating: 'up' | 'down') => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== msgId) return m;
        const newRating = m.feedback === rating ? null : rating;
        return { ...m, feedback: newRating };
      })
    );
  }, [setMessages]);

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // When closed, return null (nothing rendered)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out sm:translate-x-0 translate-x-full sm:translate-x-0">
      {/* Backdrop click to close on mobile */}
      <div className="fixed inset-0 z-[199] bg-black/30 backdrop-blur-sm" onClick={toggle} />

      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00843D] to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-[#00843D]/20">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white tracking-tight">AcademiaIQ AI</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Your academic assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Clear conversation"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar shrink-0">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60 animate-fade-in">
            <div className="p-6 rounded-full bg-[#00843D]/10">
              <Sparkles size={40} className="text-[#00843D]" />
            </div>
            <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">How can I help?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Ask me about study plans, tasks, courses, focus tips, or anything academic.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xs">
              {[
                'Create a study plan',
                'Explain calculus concepts',
                'Study tips for exams',
                'Time management',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    void handleSend();
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-[#00843D] hover:text-[#00843D] transition-all text-left min-h-[44px]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages list */}
        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-3 max-w-[90%]', m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
            <div className={cn('w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
              m.role === 'user' ? 'bg-[#00843D] text-white' : 'bg-white dark:bg-slate-800 text-[#00843D] border border-slate-200 dark:border-slate-700')}>
              {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className={cn('p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-sm leading-relaxed shadow-sm',
                m.role === 'user' ? 'bg-[#00843D] text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none')}>
                <div className="markdown-body break-words">{m.content}</div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={cn('text-[10px] font-bold uppercase tracking-widest', m.role === 'user' ? 'text-white/60' : 'text-slate-400')}>
                    {formatTime(m.timestamp)}
                  </span>
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyText(m.content, m.id)}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Copy response"
                      >
                        {copiedId === m.id ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} className="text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => giveFeedback(m.id, 'up')}
                        className={cn('p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors', m.feedback === 'up' ? 'text-emerald-500' : 'text-slate-400')} title="Helpful"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => giveFeedback(m.id, 'down')}
                        className={cn('p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors', m.feedback === 'down' ? 'text-red-500' : 'text-slate-400')} title="Not helpful"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="flex gap-3 mr-auto">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-800 text-[#00843D] border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="text-xs font-medium text-slate-500 ml-1">AcademiaIQ is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 safe-area-bottom shrink-0">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
            placeholder="Ask me anything academic..."
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 outline-none focus:ring-2 focus:ring-[#00843D]/30 transition-all text-sm shadow-inner"
            autoComplete="off"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-[#00843D] text-white rounded-2xl sm:rounded-3xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-[#00843D]/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2 font-medium px-2 leading-relaxed">
          AcademiaIQ AI — always verify important information with your lecturer.
        </p>
      </div>
    </div>
  );
};

export default AIChatSidebar;
