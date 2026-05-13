/*
 * ATHENA - Student Success Platform
 * Section: AUTH - LOGIN & SIGNUP (localStorage-based)
 *
 * Changes made:
 * - Auth state persists in localStorage under key "athena_auth"
 * - Signup collects: Full Name, Student ID, Email, Password, Role (Student / Admin)
 * - Login validates against stored users in localStorage
 * - After login, user object (name, studentId, email, role) available app-wide
 * - Logout clears auth state and redirects to login screen
 * - Admin role unlocks Admin Analytics panel
 * - Preserved appData, updateAppData, addUserXp for backward compatibility
 * - XP & Achievements persist in localStorage under "athena_xp" and "athena_achievements"
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadData, saveData, AppData as StorageAppData, UserProfile, addXp, checkAndUnlockAchievements, getDefaultAppData } from '../lib/storage';

// User type for the app
export interface User {
  name: string;
  studentId: string;
  email: string;
  role: 'student' | 'admin';
}

// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  appData: StorageAppData;
  updateAppData: (updater: (prev: StorageAppData) => StorageAppData) => void;
  addUserXp: (amount: number) => { newlyUnlocked: any[] };
  showAchievement: any;
  setShowAchievement: (a: any) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appData, setAppDataState] = useState<StorageAppData>(getDefaultAppData());
  const [showAchievement, setShowAchievement] = useState<any>(null);

  // Load user from localStorage on startup
  useEffect(() => {
    const stored = localStorage.getItem('athena_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setToken('logged-in');
      } catch {
        localStorage.removeItem('athena_auth');
      }
    }
    // Load app data
    const data = loadData('app_data', getDefaultAppData());
    setAppDataState(data);
    setIsLoading(false);
  }, []);

  // Login function
  const login = (userData: User) => {
    localStorage.setItem('athena_auth', JSON.stringify(userData));
    setUser(userData);
    setToken('logged-in');
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('athena_auth');
    setUser(null);
    setToken(null);
  };

  // Update app data
  const updateAppData = useCallback((updater: (prev: StorageAppData) => StorageAppData) => {
    setAppDataState(prev => {
      const next = updater(prev);
      saveData('app_data', next);
      return next;
    });
  }, []);

  // Add XP and check achievements
  const addUserXp = useCallback((amount: number) => {
    let result: any[] = [];
    updateAppData(prev => {
      let data = addXp(prev, amount);
      const checked = checkAndUnlockAchievements(data);
      data = checked.data;
      result = checked.newlyUnlocked;
      if (result.length > 0) {
        setShowAchievement(result[0]);
      }
      return data;
    });
    return { newlyUnlocked: result };
  }, [updateAppData]);

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, isLoading,
      appData, updateAppData, addUserXp,
      showAchievement, setShowAchievement
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};