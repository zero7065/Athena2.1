import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Mail } from 'lucide-react';
import { getSupportSettings, logAudit } from '../lib/storage';
import { useAuth } from '../context/AuthContext';

interface FloatingSupportProps {
  onOpenFeedback: () => void;
}

const FloatingSupport: React.FC<FloatingSupportProps> = ({ onOpenFeedback }) => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(getSupportSettings());
  const { user, updateAppData } = useAuth();

  useEffect(() => {
    setSettings(getSupportSettings());
  }, []);

  const markContacted = () => {
    if (user) {
      updateAppData(prev => ({ ...prev, user: { ...prev.user, contactedSupport: true } }));
    }
  };

  if (!settings.enabled) return null;

  const handleWhatsApp = () => {
    if (user) {
      logAudit(user.email, user.name, 'support_contact', 'Clicked WhatsApp contact');
    }
    markContacted();
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${settings.whatsappMessage}`, '_blank');
  };

  const handleEmail = () => {
    if (user) {
      logAudit(user.email, user.name, 'support_contact', 'Clicked email contact');
    }
    markContacted();
    window.location.href = `mailto:${settings.email}`;
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[150] flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 w-56 animate-slide-up">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Get Help</div>
          <button onClick={handleWhatsApp}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-200 transition-colors text-sm font-medium">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <MessageCircle size={16} className="text-white" />
            </div>
            WhatsApp Support
          </button>
          <button onClick={handleEmail}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-200 transition-colors text-sm font-medium">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <Mail size={16} className="text-white" />
            </div>
            Email Support
          </button>
          <button onClick={onOpenFeedback}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-700 dark:text-slate-200 transition-colors text-sm font-medium">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            Rate &amp; Review
          </button>
          <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 text-center">{settings.phone}</p>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center relative"
        title="Get Help">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
};

export default FloatingSupport;
