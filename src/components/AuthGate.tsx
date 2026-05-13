import React, { useState, useEffect } from 'react';
import { GraduationCap, AlertCircle, Loader2, LogOut } from 'lucide-react';

/* Google OAuth via Identity Services — inline to avoid module resolution issues */
declare global {
  interface Window {
    google?: any;
    plasuAuthCallback?: (user: { email: string; name: string; picture: string } | null) => void;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function loadGIS(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById('gis-script')) { resolve(); return; }
    const s = document.createElement('script');
    s.id = 'gis-script';
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; name: string; picture: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!CLIENT_ID) {
      setError('Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID.');
      setLoading(false);
      return;
    }

    window.plasuAuthCallback = (u) => {
      setUser(u);
      setLoading(false);
    };

    loadGIS().then(() => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: any) => {
          try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const email: string = payload.email || '';
            const domain = email.split('@')[1];
            if (domain !== 'plasu.edu.ng') {
              setError('Access is restricted to PLASU students and staff. Please use your @plasu.edu.ng email.');
              setLoading(false);
              return;
            }
            setUser({ email, name: payload.name || email.split('@')[0], picture: payload.picture || '' });
          } catch {
            setError('Sign-in failed. Please try again.');
          }
          setLoading(false);
        },
      });
      setLoading(false);
    });

    return () => { window.plasuAuthCallback = undefined; };
  }, []);

  const handleSignIn = () => {
    setError('');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google sign-in is loading. Please try again.');
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 size={32} className="animate-spin text-[#00843D]" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <>
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">{user.email}</span>
          <button onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 hover:text-red-500 hover:border-red-200 transition-all min-h-[36px]">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="glass-strong p-8 sm:p-10 rounded-[40px] text-center max-w-sm w-full space-y-6">
        <div className="w-16 h-16 bg-[#00843D] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg">
          <GraduationCap size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">PLASU <span className="text-[#00843D]">Athena</span></h2>
          <p className="text-sm text-slate-500 mt-1">Your Academic AI Assistant</p>
          <p className="text-xs text-slate-400 mt-2">Sign in with your PLASU email to continue.</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-left">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-h-[48px]">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.30-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </button>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          Only @plasu.edu.ng email addresses are allowed.
        </p>
      </div>
    </div>
  );
};

export default AuthGate;
