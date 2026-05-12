import React, { useState } from 'react';
import { X, Mail, Lock, User, GraduationCap, Building2, Calendar, UserCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadData, getDefaultAppData } from '../lib/storage';

interface AuthProps {
  mode: 'login' | 'register';
  setMode: (mode: 'login' | 'register') => void;
  onClose: () => void;
}

const EXAMPLE_CREDENTIALS = [
  { email: 'admin@plasu.edu.ng', password: 'admin123', role: 'Admin', label: 'Full access to everything' },
  { email: 'lecturer@plasu.edu.ng', password: 'lecturer123', role: 'Lecturer', label: 'Manage courses & students' },
  { email: 'student@plasu.edu.ng', password: 'student123', role: 'Student', label: 'Study & collaborate' },
];

const USERS_KEY = 'athena_users';

interface SavedUser {
  email: string;
  password: string;
  name: string;
  department: string;
  yearOfStudy: number;
  role: 'student' | 'lecturer' | 'admin';
  title?: string;
}

function getSavedUsers(): SavedUser[] {
  return loadData<SavedUser[]>('users', []);
}

function saveUser(u: SavedUser) {
  const users = getSavedUsers();
  users.push(u);
  try { localStorage.setItem('athena_users', JSON.stringify(users)); } catch {}
}

const Auth: React.FC<AuthProps> = ({ mode, setMode, onClose }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
    year_of_study: 1,
    role: 'student' as 'student' | 'lecturer' | 'admin',
    title: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const fillExample = (ex: typeof EXAMPLE_CREDENTIALS[0]) => {
    setFormData(prev => ({
      ...prev,
      email: ex.email,
      password: ex.password,
      role: ex.role.toLowerCase() as any,
    }));
    setError('');
  };

  const handleLocalLogin = (email: string, password: string): SavedUser | null => {
    const users = getSavedUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) return user;

    const ex = EXAMPLE_CREDENTIALS.find(e => e.email === email && e.password === password);
    if (ex) {
      return {
        email: ex.email,
        password: ex.password,
        name: ex.role === 'Admin' ? 'Admin User' : ex.role === 'Lecturer' ? 'Dr. Lecturer' : 'Student User',
        department: 'Computer Science',
        yearOfStudy: 2,
        role: ex.role.toLowerCase() as any,
        title: ex.role === 'Lecturer' ? 'Dr.' : undefined,
      };
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (mode === 'login') {
      const user = handleLocalLogin(formData.email, formData.password);
      if (!user) {
        setError('Invalid email or password. Try the example accounts below.');
        setIsLoading(false);
        return;
      }
      const stored = loadData('app_data', getDefaultAppData());
      stored.user = {
        ...stored.user,
        name: user.name,
        email: user.email,
        department: user.department,
        yearOfStudy: user.yearOfStudy,
        isAdmin: user.role === 'admin',
        role: user.role,
        title: user.title || '',
      };
      login('local', stored.user);
      onClose();
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('All fields are required.');
        setIsLoading(false);
        return;
      }
      if (getSavedUsers().some(u => u.email === formData.email)) {
        setError('An account with this email already exists.');
        setIsLoading(false);
        return;
      }
      saveUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        department: formData.department,
        yearOfStudy: formData.year_of_study,
        role: formData.role,
        title: formData.title,
      });
      const stored = loadData('app_data', getDefaultAppData());
      stored.user = {
        ...stored.user,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        yearOfStudy: formData.year_of_study,
        isAdmin: formData.role === 'admin',
        role: formData.role,
        title: formData.title,
      };
      login('local', stored.user);
      onClose();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] shadow-2xl relative border border-slate-200 dark:border-slate-800">
      <button onClick={onClose}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Close">
        <X size={20} />
      </button>

      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={24} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">ATHENA</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] leading-none mt-1">PLASU Edition</span>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center">
          {mode === 'login' ? 'Welcome Back' : 'Join ATHENA'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium text-center">
          {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
        </p>
      </div>

      {mode === 'login' && !showExamples && (
        <button onClick={() => setShowExamples(true)}
          className="w-full mb-4 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 transition-all">
          Need test credentials? Click here
        </button>
      )}

      {showExamples && (
        <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Test Accounts</p>
            <button onClick={() => setShowExamples(false)} className="text-[10px] text-slate-400 hover:text-primary">Hide</button>
          </div>
          {EXAMPLE_CREDENTIALS.map(ex => (
            <button key={ex.email} onClick={() => fillExample(ex)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all text-left border border-transparent hover:border-primary/20">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{ex.role}</p>
                <p className="text-[10px] text-slate-400">{ex.label}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-primary">{ex.email}</p>
                <p className="text-[10px] font-mono text-slate-400">{ex.password}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {mode === 'register' && (
          <>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 sm:mb-4">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.role === 'student' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>
                Student
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'lecturer' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.role === 'lecturer' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>
                Lecturer
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.role === 'admin' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>
                Admin
              </button>
            </div>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Full Name" required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder={formData.role === 'student' ? 'Dept' : 'Faculty'} required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
                  value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
              </div>
              <div className="relative">
                {formData.role === 'student' ? (
                  <>
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <select className="w-full pl-12 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer text-base"
                      value={formData.year_of_study} onChange={e => setFormData({ ...formData, year_of_study: parseInt(e.target.value) })}>
                      {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Title (e.g. Dr.)"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
                      value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  </>
                )}
              </div>
            </div>
          </>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="email" placeholder="Email Address" required
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type={showPassword ? 'text' : 'password'} placeholder="Password" required
            className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-xs text-red-500 font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{error}</p>}

        <button type="submit" disabled={isLoading}
          className="w-full bg-primary text-white font-bold rounded-xl py-3 sm:py-4 text-base sm:text-lg shadow-xl shadow-primary/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 min-h-[48px]">
          {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-slate-500 font-medium">
        {mode === 'login' ? (
          <>Don't have an account?{' '}<button onClick={() => setMode('register')} className="text-primary font-extrabold hover:underline">Sign Up</button></>
        ) : (
          <>Already have an account?{' '}<button onClick={() => setMode('login')} className="text-primary font-extrabold hover:underline">Sign In</button></>
        )}
      </div>
    </div>
  );
};

export default Auth;
