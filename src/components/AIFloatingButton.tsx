/*
 * AcademiaIQ - Floating AI Assistant Button
 * Persistent floating button that opens the AI chat sidebar.
 */

import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useAI } from '../context/AIContext';

const AIFloatingButton: React.FC = () => {
  const { isOpen, toggle, isLoading } = useAI();
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2 pointer-events-none">
      {/* Floating AI button */}
      <button
        onClick={toggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00843D] to-emerald-500 text-white shadow-2xl shadow-[#00843D]/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 pointer-events-auto"
        aria-label={isOpen ? 'Close AcademiaIQ AI Assistant' : 'Open AcademiaIQ AI Assistant'}
      >
        {isLoading ? (
          <Sparkles size={24} className="animate-spin" />
        ) : (
          <Bot size={24} />
        )}
      </button>

      {/* Hover label */}
      {hovered && (
        <div className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 whitespace-nowrap animate-fade-in pointer-events-none">
          AcademiaIQ AI
        </div>
      )}
    </div>
  );
};

export default AIFloatingButton;
