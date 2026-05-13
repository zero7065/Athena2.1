/*
 * ATHENA - Student Success Platform
 * Section: AUTH - LOGIN & SIGNUP
 * - Complete auth system with localStorage persistence
 * - Signup: Full Name, Student ID, Email, Password, Role (Student/Admin)
 * - Password validation: min 8 chars, at least 1 number, 1 uppercase
 * - Confirm password field with match validation
 * - Inline error messages for each field
 * - Loading state on submit
 * - "Invalid credentials" error message
 * - "Account already exists" error on signup
 * - Auth state persists in localStorage under "athena_auth"
 * - Users stored in localStorage under "athena_users"
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User, GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth, User as AuthUser } from '../context/AuthContext';

interface AuthProps {
  mode: 'login' | 'register';
  setMode: (mode: 'login' | 'register') => void;
  onClose: () => void;
}

// Storage keys
const USERS_KEY = 'athena_users';

// User type for stored users
interface StoredUser {
  email: string;
  password: string;
  name: string;
  studentId: string;
  department: string;
  role: 'student' | 'lecturer' | 'admin';
}

// Get users from localStorage
function getStoredUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save users to localStorage
function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Password validation
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
    name: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'lecturer' | 'admin',
    department: '',
  });
  
  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear field-specific error when user types
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  // Validate single field
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        return value.trim() ? '' : 'Full Name is required';
      case 'studentId':
        return value.trim() ? '' : 'Student ID is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format';
      case 'password':
        if (!value) return 'Password is required';
        const pwdValidation = validatePassword(value);
        return pwdValidation.valid ? '' : pwdValidation.errors[0];
      case 'confirmPassword':
        return value === formData.password ? '' : 'Passwords do not match';
      default:
        return '';
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError('');

    // Validate fields
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      setIsSubmitting(false);
      return;
    }

    // Simulate async login
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check against stored users
    const users = getStoredUsers();
    const user = users.find(u => u.email === formData.email && u.password === formData.password);

    if (!user) {
      setGeneralError('Invalid credentials');
      setIsSubmitting(false);
      return;
    }

    // Login successful
    const authUser: AuthUser = {
      name: user.name,
      studentId: user.studentId,
      email: user.email,
      role: user.role,
    };
    login(authUser);
    setIsSubmitting(false);
    onClose();
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError('');

    // Validate all fields
    const errors: Record<string, string> = {};
    ['name', 'studentId', 'email', 'password', 'confirmPassword', 'department'].forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) errors[field] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // Simulate async registration
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    const users = getStoredUsers();
    if (users.some(u => u.email === formData.email)) {
      setFieldErrors({ email: 'Account already exists' });
      setIsSubmitting(false);
      return;
    }

    // Create new user
    const newUser: StoredUser = {
      name: formData.name,
      studentId: formData.studentId,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      role: formData.role,
    };

    // Save user
    users.push(newUser);
    saveUsers(users);

    // Login the new user
    const authUser: AuthUser = {
      name: newUser.name,
      studentId: newUser.studentId,
      email: newUser.email,
      role: newUser.role,
    };
    login(authUser);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = mode === 'login' ? handleLogin : handleRegister;

  const isLoading = isSubmitting || authLoading;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] shadow-2xl relative border border-slate-200 dark:border-slate-800 max-w-md w-full">
      <button 
        onClick={onClose}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-12 h-12 bg-[#00843D] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={24} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">ATHENA</span>
            <span className="text-[10px] text-[#00843D] font-bold uppercase tracking-[0.2em] leading-none mt-1">PLASU Edition</span>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center">
          {mode === 'login' ? 'Welcome Back' : 'Join ATHENA'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium text-center">
          {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Registration Fields */}
        {mode === 'register' && (
          <>
            {/* Role Selection */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button 
                type="button" 
                onClick={() => handleChange('role', 'student')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.role === 'student' ? 'bg-white dark:bg-slate-700 text-[#00843D] shadow-sm' : 'text-slate-500'}`}
              >
                Student
              </button>
              <button 
                type="button" 
                onClick={() => handleChange('role', 'lecturer')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.role === 'lecturer' ? 'bg-white dark:bg-slate-700 text-[#00843D] shadow-sm' : 'text-slate-500'}`}
              >
                Lecturer
              </button>
              <button 
                type="button" 
                onClick={() => handleChange('role', 'admin')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.role === 'admin' ? 'bg-white dark:bg-slate-700 text-[#00843D] shadow-sm' : 'text-slate-500'}`}
              >
                Admin
              </button>
            </div>

            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${fieldErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base font-size: 16px`}
                style={{ fontSize: '16px' }}
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Student ID (or Staff ID for lecturers) */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={formData.role === 'lecturer' ? 'Staff ID' : 'Student ID'} 
                value={formData.studentId}
                onChange={(e) => handleChange('studentId', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${fieldErrors.studentId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base font-size: 16px`}
                style={{ fontSize: '16px' }}
              />
              {fieldErrors.studentId && (
                <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.studentId}</p>
              )}
            </div>

            {/* Department / Faculty */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={formData.role === 'lecturer' ? 'Faculty / Department' : 'Department'} 
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base font-size: 16px`}
                style={{ fontSize: '16px' }}
              />
              {fieldErrors.department && (
                <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.department}</p>
              )}
            </div>
          </>
        )}

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${fieldErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base font-size: 16px`}
            style={{ fontSize: '16px' }}
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type={showPassword ? 'text' : 'password'} 
            placeholder="Password" 
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={`w-full pl-12 pr-12 py-3 rounded-xl border ${fieldErrors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base font-size: 16px`}
            style={{ fontSize: '16px' }}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00843D] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {fieldErrors.password && (
            <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password (Registration only) */}
        {mode === 'register' && (
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#00843D] outline-none transition-all text-base font-size: 16px`}
              style={{ fontSize: '16px' }}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00843D] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>
        )}

        {/* General Error */}
        {generalError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{generalError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-[#00843D] text-white font-bold rounded-xl py-3 sm:py-4 text-base sm:text-lg shadow-xl shadow-[#00843D]/20 hover:bg-[#006a2f] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      {/* Toggle Mode */}
      <div className="mt-6 text-center text-xs sm:text-sm text-slate-500 font-medium">
        {mode === 'login' ? (
          <>Don't have an account?{' '}
            <button 
              onClick={() => { setMode('register'); setFieldErrors({}); setGeneralError(''); }} 
              className="text-[#00843D] font-extrabold hover:underline"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button 
              onClick={() => { setMode('login'); setFieldErrors({}); setGeneralError(''); }} 
              className="text-[#00843D] font-extrabold hover:underline"
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;