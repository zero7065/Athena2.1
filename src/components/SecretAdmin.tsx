/*
 * ATHENA - Student Success Platform
 * Section: SECRET ADMIN ACCESS
 *
 * Hidden admin login: only accessible via /admin-secret path.
 * Logs all login attempts (successful and failed) with timestamps.
 * NOT visible in the signup form or any navigation.
 */

import React, { useState } from 'react';
import AdminPanel from './AdminPanel';
import { AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';

const SECRET_ADMIN_KEY = 'athena_admin_master_2025';

const SecretAdmin: React.FC = () => {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<Array<{ timestamp: string; success: boolean; key: string }>>([]);

  const handleAdminLogin = () => {
    setError('');
    const timestamp = new Date().toISOString();

    if (adminKey === SECRET_ADMIN_KEY) {
      setIsAuthenticated(true);
      setLogs(prev => [...prev, { timestamp, success: true, key: '****' }]);
      setAdminKey('');
    } else {
      setLogs(prev => [...prev, { timestamp, success: false, key: adminKey }]);
      setError('Invalid admin key');
    }
  };

  if (isAuthenticated) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
          >
            Lock Admin Panel
          </button>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-amber-500/5">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-amber-400">Admin Access</h1>
          <p className="text-xs text-slate-500 mt-1">Restricted — authentication required</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-xs">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={adminKey}
              onChange={(e) => { setAdminKey(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Enter admin key..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 pr-12"
              autoFocus
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            onClick={handleAdminLogin}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all active:scale-[0.98]"
          >
            Authenticate
          </button>
        </div>

        {/* Credential logs */}
        <div className="mt-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Access Logs</p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No login attempts recorded</p>
            ) : (
              [...logs].reverse().map((log, i) => (
                <p key={i} className={`text-[10px] font-mono ${log.success ? 'text-emerald-500' : 'text-red-500'}`}>
                  {log.success ? '✅' : '❌'} {log.timestamp.slice(0, 19).replace('T', ' ')}
                  {!log.success && ` — key: "${log.key}"`}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretAdmin;