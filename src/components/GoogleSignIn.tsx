import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from '../lib/firebase';
import { Google } from 'lucide-react';
import { cn } from '../lib/utils';

const GoogleSignIn: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle Firebase auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Check if email is from PLASU domain
        if (fbUser.email && fbUser.email.endsWith('@plasu.edu.ng')) {
          // Create a token for our app (in production, you'd use a backend)
          const token = btoa(JSON.stringify({
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            yearOfStudy: 2, // Default, could be from profile
            department: 'Computer Science', // Default
            is_admin: fbUser.email.includes('@plasu.edu.ng') && 
                     (fbUser.email.startsWith('admin.') || 
                      fbUser.email.startsWith('lecturer.') ||
                      fbUser.email.startsWith('hod.')),
            role: fbUser.email.includes('@plasu.edu.ng') && 
                 (fbUser.email.startsWith('lecturer.') || 
                  fbUser.email.startsWith('admin.')) ? 'lecturer' : 'student',
            streak: 0,
            lastLoginDate: '',
            xp: 0,
            level: 1,
            themeColor: '#00843D',
            fontPreference: 'sans'
          }));
          
          login(token, {
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            department: 'Computer Science',
            yearOfStudy: 2,
            xp: 0,
            level: 1,
            streak: 0,
            lastLoginDate: '',
            isAdmin: fbUser.email.includes('@plasu.edu.ng') && 
                     (fbUser.email.startsWith('admin.') || 
                      fbUser.email.startsWith('lecturer.') ||
                      fbUser.email.startsWith('hod.')),
            role: fbUser.email.includes('@plasu.edu.ng') && 
                 (fbUser.email.startsWith('lecturer.') || 
                  fbUser.email.startsWith('admin.')) ? 'lecturer' : 'student',
            themeColor: '#00843D',
            fontPreference: 'sans'
          });
        } else {
          // Sign out if not PLASU email
          signOut(auth).then(() => {
            setError('Access is restricted to PLASU students and staff.');
          });
        }
      }
    });

    return () => unsubscribe();
  }, [login]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, ignore
        return;
      }
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google sign in error:', err);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      logout();
    } catch (err) {
      console.error('Sign out error:', err);
      logout(); // Still logout from our app
    }
  }, [logout]);

  if (isLoading && !firebaseUser && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-12 h-12 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-[#00843D] font-bold animate-pulse uppercase tracking-widest text-xs">Initializing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700 dark:text-red-200 font-medium">{error}</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-[#00843D]/10 flex items-center justify-center rounded-full">
          {user.name?.[0]?.toUpperCase() || 'S'}
        </div>
        <div className="space-y-1 text-center">
          <p className="font-semibold text-slate-800 dark:text-white">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <p className="text-xs text-slate-400">
            {user.role === 'lecturer' ? 'Lecturer' : 'Student'} • 
            {user.department} • Year {user.yearOfStudy}
          </p>
        </div>
        <button 
          onClick={handleSignOut}
          className="w-full max-w-xs px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <LucideIcon icon={"/Users/Stylez/OneDrive/Documentos/athena2.0/src/lib/lucide-react"} name="LogOut" size={16} />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* PLASU Branding */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-14 h-14 bg-[#00843D] flex items-center justify-center rounded-xl">
          <Google size={24} className="text-white" />
        </div>
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            PLASU <span className="text-[#00843D]">Athena</span>
          </h1>
          <p className="text-sm text-slate-500">Academic AI Assistant</p>
        </div>
      </div>

      {/* Sign In Button */}
      <button 
        onClick={handleGoogleSignIn}
        disabled={!!firebaseUser}
        className="w-full max-w-xs px-6 py-3 bg-[#00843D] hover:bg-[#006a2f] text-white font-medium rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg"
      >
        <Google size={20} className="mr-2" />
        Sign in with Google
      </button>

      {/* Restriction Notice */}
      <div className="text-center text-sm max-w-xl">
        <p className="text-slate-500 dark:text-slate-400">
          Access is restricted to PLASU students and staff only. 
          Please sign in with your @plasu.edu.ng email address.
        </p>
      </div>
    </div>
  );
};

export default GoogleSignIn;