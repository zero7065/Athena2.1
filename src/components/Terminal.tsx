import React, { useState } from 'react';
import { X, Terminal as TerminalIcon, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ADMIN_PASSWORD = '0000';

const Terminal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setShowTerminal, login, setAdminClickCount } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      login({ name: 'Admin User', email: 'admin@unipulse.io', studentId: 'ADM001', role: 'admin', department: 'Administration' });
      setShowTerminal(false);
      setAdminClickCount(0);
      onClose();
    } else {
      setError('Invalid admin password');
      setPassword('');
    }
  };

  const handleClose = () => {
    setShowTerminal(false);
    setAdminClickCount(0);
    onClose();
  };

  if (isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-amber-500/5 text-center space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield size={32} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-black text-amber-400">Admin Access Granted</h2>
            <p className="text-xs text-slate-500 mt-1">Welcome to the CampusIQ management console.</p>
          </div>
          <button onClick={handleClose} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all min-h-[48px]">Enter Admin Panel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-amber-500/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon size={18} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400">CampusIQ Admin Terminal</span>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500">Enter admin access code to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Admin code"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/50"
            autoFocus
            style={{ fontSize: '16px' }}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all min-h-[48px]">
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Terminal;
