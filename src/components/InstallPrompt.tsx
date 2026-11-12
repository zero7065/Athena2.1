import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { cn } from '../lib/utils';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner || installed) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 z-[70] px-1">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-emerald-100 dark:border-slate-700 p-3 sm:p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00843D] to-emerald-500 flex items-center justify-center text-white shrink-0">
          <Download size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-800 dark:text-white">Install UniPulse</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Add to your home screen for quick access &amp; offline use.</p>
        </div>
        <button onClick={install} className="btn-primary px-4 py-2 text-xs min-h-[44px] font-bold whitespace-nowrap">
          Install
        </button>
        <button onClick={() => setShowBanner(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
