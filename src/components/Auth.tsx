import React, { useState } from 'react';
import { X, Mail, Lock, User, GraduationCap, Eye, EyeOff, AlertCircle, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../types';

interface AuthProps {
  mode: 'login' | 'register';
  setMode: (mode: 'login' | 'register') => void;
  onClose: () => void;
}

const USERS_KEY = 'athena_users';

interface StoredUser {
  email: string;
  password: string;
  name: string;
  studentId: string;
  department: string;
  role: 'student' | 'lecturer' | 'admin';
}

const DEMO_ACCOUNTS = [
  { name: 'Student Demo', email: 'student@plasu.edu.ng', password: 'student123', role: 'student' as const, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: GraduationCap },
  { name: 'Lecturer Demo', email: 'lecturer@plasu.edu.ng', password: 'lecturer123', role: 'lecturer' as const, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: BookOpen },
  { name: 'Admin Demo', email: 'admin@plasu.edu.ng', password: 'admin123', role: 'admin' as const, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: ShieldCheck },
];

function getStoredUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least 1 number');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least 1 uppercase letter');
  return { valid: errors.length === 0, errors };
}

const Auth: React.FC<AuthProps> = ({ mode, setMode, onClose }) => {
  const { login, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '', studentId: '', email: '', password: '', confirmPassword: '',
    role: 'student' as 'student' | 'lecturer' | 'admin', department: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
    if (generalError) setGeneralError('');
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name': return value.trim() ? '' : 'Full Name is required';
      case 'studentId': return value.trim() ? '' : 'ID is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        const pwdValidation = validatePassword(value);
        return pwdValidation.valid ? '' : pwdValidation.errors[0];
      case 'confirmPassword': return value === formData.password ? '' : 'Passwords do not match';
      default: return '';
    }
  };

  const quickLogin = async (demo: typeof DEMO_ACCOUNTS[0]) => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    const users = getStoredUsers();
    const user = users.find(u => u.email === demo.email && u.password === demo.password);
    if (user) {
      const authUser: AuthUser = { name: user.name, studentId: user.studentId, email: user.email, role: user.role, department: user.department };
      login(authUser);
      onClose();
    }
    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setFieldErrors({}); setGeneralError('');
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    if (emailError || passwordError) { setFieldErrors({ email: emailError, password: passwordError }); setIsSubmitting(false); return; }
    await new Promise(r => setTimeout(r, 500));
    const users = getStoredUsers();
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    if (!user) { setGeneralError('Invalid credentials'); setIsSubmitting(false); return; }
    const authUser: AuthUser = { name: user.name, studentId: user.studentId, email: user.email, role: user.role, department: user.department };
    login(authUser);
    setIsSubmitting(false);
    onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setFieldErrors({}); setGeneralError('');
    const errors: Record<string, string> = {};
    ['name', 'studentId', 'email', 'password', 'confirmPassword', 'department'].forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) errors[field] = error;
    });
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); setIsSubmitting(false); return; }
    await new Promise(r => setTimeout(r, 500));
    const users = getStoredUsers();
    if (users.some(u => u.email === formData.email)) { setFieldErrors({ email: 'Account already exists' }); setIsSubmitting(false); return; }
    const newUser: StoredUser = { name: formData.name, studentId: formData.studentId, email: formData.email, password: formData.password, department: formData.department, role: formData.role };
    users.push(newUser);
    saveUsers(users);
    const authUser: AuthUser = { name: newUser.name, studentId: newUser.studentId, email: newUser.email, role: newUser.role, department: newUser.department };
    login(authUser);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = mode === 'login' ? handleLogin : handleRegister;
  const isLoading = isSubmitting || authLoading;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] shadow-2xl relative border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden">
      <button onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center z-10">
        <X size={20} />
      </button>

      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00843D] to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={24} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">ATHENA</span>
            <span className="text-[8px] text-[#00843D] font-bold uppercase tracking-[0.2em] leading-none mt-0.5">by Jadai Studios</span>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center">
          {mode === 'login' ? 'Welcome Back' : 'Join ATHENA'}
        </h2>
        <p className="text-xs text-slate-500 mt-2 font-medium text-center">
          {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
        </p>
      </div>

      {/* Demo Quick Login */}
      {mode === 'login' && (
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Quick Access</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map(demo => (
              <button key={demo.email} type="button" onClick={() => quickLogin(demo)} disabled={isLoading}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl ${demo.bg} hover:scale-105 transition-all min-h-[56px]`}>
                <demo.icon size={18} className={demo.color} />
                <span className={`text-[9px] font-bold ${demo.color} leading-tight text-center`}>{demo.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button type="button" onClick={() => handleChange('role', 'student')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all min-h-[36px] ${formData.role === 'student' ? 'bg-white dark:bg-slate-700 text-[#00843D] shadow-sm' : 'text-slate-500'}`}>Student</button>
              <button type="button" onClick={() => handleChange('role', 'lecturer')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all min-h-[36px] ${formData.role === 'lecturer' ? 'bg-white dark:bg-slate-700 text-[#00843D] shadow-sm' : 'text-slate-500'}`}>Lecturer</button>
            </div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Full Name" value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${fieldErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base`} style={{ fontSize: '16px' }} />
              {fieldErrors.name && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.name}</p>}
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder={formData.role === 'lecturer' ? 'Staff ID' : 'Student ID'} value={formData.studentId}
                onChange={e => handleChange('studentId', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${fieldErrors.studentId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base`} style={{ fontSize: '16px' }} />
              {fieldErrors.studentId && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.studentId}</p>}
            </div>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder={formData.role === 'lecturer' ? 'Faculty / Department' : 'Department'} value={formData.department}
                onChange={e => handleChange('department', e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base" style={{ fontSize: '16px' }} />
              {fieldErrors.department && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.department}</p>}
            </div>
          </>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="email" placeholder="Email Address" value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${fieldErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base`} style={{ fontSize: '16px' }} />
          {fieldErrors.email && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.email}</p>}
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData.password}
            onChange={e => handleChange('password', e.target.value)}
            className={`w-full pl-12 pr-12 py-3 rounded-xl border ${fieldErrors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base`} style={{ fontSize: '16px' }} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00843D] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {fieldErrors.password && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.password}</p>}
        </div>

        {mode === 'register' && (
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={formData.confirmPassword}
              onChange={e => handleChange('confirmPassword', e.target.value)}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base`} style={{ fontSize: '16px' }} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00843D] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.confirmPassword}</p>}
          </div>
        )}

        {generalError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{generalError}</p>
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#00843D] to-emerald-600 text-white font-bold rounded-xl py-3 sm:py-4 text-base shadow-xl shadow-[#00843D]/20 hover:shadow-2xl hover:shadow-[#00843D]/30 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[48px]">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              Processing...
            </span>
          ) : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-500 font-medium">
        {mode === 'login' ? (
          <>Don't have an account?{' '}
            <button onClick={() => { setMode('register'); setFieldErrors({}); setGeneralError(''); }}
              className="text-[#00843D] font-extrabold hover:underline">Sign Up</button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button onClick={() => { setMode('login'); setFieldErrors({}); setGeneralError(''); }}
              className="text-[#00843D] font-extrabold hover:underline">Sign In</button>
          </>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">Powered by <span className="font-bold text-slate-500">Jadai Studios</span></p>
      </div>
    </div>
  );
};

export default Auth;
