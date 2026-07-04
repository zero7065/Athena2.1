import React, { useState } from 'react';
import { Mail, Lock, User, BookOpen, Eye, EyeOff, AlertCircle, GraduationCap, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../types';

interface LecturerAuthProps {
  onBack: () => void;
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

const LECTURER_SECRET_CODE = '123456lecture';

function getStoredUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const LecturerAuth: React.FC<LecturerAuthProps> = ({ onBack }) => {
  const { login, isLoading: authLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: '', staffId: '', email: '', password: '', confirmPassword: '',
    department: '', lecturerCode: '',
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
      case 'staffId': return value.trim() ? '' : 'Staff ID is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword': return value === formData.password ? '' : 'Passwords do not match';
      case 'lecturerCode': return value === LECTURER_SECRET_CODE ? '' : 'Invalid verification code. Contact the administrator.';
      default: return '';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setFieldErrors({}); setGeneralError('');
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    if (emailError || passwordError) { setFieldErrors({ email: emailError, password: passwordError }); setIsSubmitting(false); return; }
    await new Promise(r => setTimeout(r, 500));
    const users = getStoredUsers();
    const user = users.find(u => u.email === formData.email && u.password === formData.password && u.role === 'lecturer');
    if (!user) { setGeneralError('Invalid credentials or account is not a lecturer'); setIsSubmitting(false); return; }
    const authUser: AuthUser = { name: user.name, studentId: user.studentId, email: user.email, role: user.role, department: user.department };
    login(authUser);
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setFieldErrors({}); setGeneralError('');
    const errors: Record<string, string> = {};
    ['name', 'staffId', 'email', 'password', 'confirmPassword', 'lecturerCode'].forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) errors[field] = error;
    });
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); setIsSubmitting(false); return; }
    await new Promise(r => setTimeout(r, 500));
    const users = getStoredUsers();
    if (users.some(u => u.email === formData.email)) { setFieldErrors({ email: 'Account already exists' }); setIsSubmitting(false); return; }
    const newUser: StoredUser = {
      name: formData.name,
      studentId: formData.staffId,
      email: formData.email,
      password: formData.password,
      department: formData.department || 'Faculty',
      role: 'lecturer',
    };
    users.push(newUser);
    saveUsers(users);
    const authUser: AuthUser = { name: newUser.name, studentId: newUser.studentId, email: newUser.email, role: newUser.role, department: newUser.department };
    login(authUser);
    setIsSubmitting(false);
  };

  const handleSubmit = mode === 'login' ? handleLogin : handleRegister;
  const isLoading = isSubmitting || authLoading;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-950 dark:via-blue-950/10 dark:to-slate-950">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[40px] shadow-2xl shadow-black/10 border border-white/40 dark:border-slate-700/40 max-w-md w-full relative animate-scale-in">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-600/20 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <button onClick={onBack}
          className="absolute top-4 left-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center z-10">
          <ArrowLeft size={20} className="text-slate-400" />
        </button>

        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 animate-float">
              <BookOpen size={24} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">ATHENA</span>
              <span className="text-[8px] text-blue-600 font-bold uppercase tracking-[0.2em] leading-none mt-0.5">Lecturer Portal</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-3">
            <ShieldCheck size={12} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Staff Only</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center">
            {mode === 'login' ? 'Lecturer Sign In' : 'Lecturer Registration'}
          </h2>
          <p className="text-xs text-slate-500 mt-2 font-medium text-center">
            {mode === 'login' ? 'Access your lecturer dashboard' : 'Register with your staff credentials'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Full Name" value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className={`input-field pl-12 ${fieldErrors.name ? 'border-red-500' : ''}`} style={{ fontSize: '16px' }} />
                {fieldErrors.name && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.name}</p>}
              </div>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Staff ID" value={formData.staffId}
                  onChange={e => handleChange('staffId', e.target.value)}
                  className={`input-field pl-12 ${fieldErrors.staffId ? 'border-red-500' : ''}`} style={{ fontSize: '16px' }} />
                {fieldErrors.staffId && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.staffId}</p>}
              </div>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Faculty / Department" value={formData.department}
                  onChange={e => handleChange('department', e.target.value)}
                  className="input-field pl-12" style={{ fontSize: '16px' }} />
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <input type="password" placeholder="Lecturer Verification Code" value={formData.lecturerCode}
                  onChange={e => handleChange('lecturerCode', e.target.value)}
                  className={`input-field pl-12 pr-12 border-blue-200 dark:border-blue-800 ${fieldErrors.lecturerCode ? 'border-red-500' : 'focus:border-blue-500'}`} style={{ fontSize: '16px' }} />
                {fieldErrors.lecturerCode && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.lecturerCode}</p>}
                {!fieldErrors.lecturerCode && mode === 'register' && (
                  <p className="text-[9px] text-slate-400 mt-1 ml-1">Enter the code provided by the administrator</p>
                )}
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="email" placeholder="Email Address" value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              className={`input-field pl-12 ${fieldErrors.email ? 'border-red-500' : ''}`} style={{ fontSize: '16px' }} />
            {fieldErrors.email && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.email}</p>}
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData.password}
              onChange={e => handleChange('password', e.target.value)}
              className={`input-field pl-12 pr-12 ${fieldErrors.password ? 'border-red-500' : ''}`} style={{ fontSize: '16px' }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {fieldErrors.password && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.password}</p>}
          </div>

          {mode === 'register' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={formData.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                className={`input-field pl-12 pr-12 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`} style={{ fontSize: '16px' }} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.confirmPassword}</p>}
            </div>
          )}

          {generalError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-slide-down">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{generalError}</p>
            </div>
          )}

          <button type="submit" disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl py-3 sm:py-4 text-base shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[48px]">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                Processing...
              </span>
            ) : mode === 'login' ? 'Sign In as Lecturer' : 'Register as Lecturer'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 font-medium relative z-10">
          {mode === 'login' ? (
            <>Don't have a lecturer account?{' '}
              <button onClick={() => { setMode('register'); setFieldErrors({}); setGeneralError(''); }}
                className="text-blue-600 font-extrabold hover:underline hover:text-indigo-600 transition-colors">Register Here</button>
            </>
          ) : (
            <>Already registered?{' '}
              <button onClick={() => { setMode('login'); setFieldErrors({}); setGeneralError(''); }}
                className="text-blue-600 font-extrabold hover:underline hover:text-indigo-600 transition-colors">Sign In</button>
            </>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center relative z-10">
          <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">Powered by <span className="font-bold text-slate-500">Jadai Studios</span></p>
        </div>
      </div>
    </div>
  );
};

export default LecturerAuth;
