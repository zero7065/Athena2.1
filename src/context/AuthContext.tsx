/*
 * ATHENA - Student Success Platform
 * Section: AUTH - LOGIN & SIGNUP
 *
 * - 3 roles: student, lecturer, admin
 * - Per-user appData isolation (key = athena_app_data_{email})
 * - Submissions system shared via sharedStorage helpers
 * - Auth state persists in localStorage under "athena_auth"
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadData, saveData, AppData as StorageAppData, addXp, checkAndUnlockAchievements, getDefaultAppData } from '../lib/storage';

export interface User {
  name: string;
  studentId: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  department?: string;
}

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAppDataKey(email: string): string {
  return `app_data_${email.replace(/[@.]/g, '_')}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appData, setAppDataState] = useState<StorageAppData>(getDefaultAppData());
  const [showAchievement, setShowAchievement] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('athena_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setToken('logged-in');
        // Load per-user app data
        const dataKey = getAppDataKey(parsed.email);
        const raw = localStorage.getItem(dataKey);
        if (raw) {
          setAppDataState(JSON.parse(raw));
        } else {
          // Migrate old shared key if first login
          const oldData = loadData('app_data', getDefaultAppData());
          localStorage.setItem(dataKey, JSON.stringify(oldData));
          setAppDataState(oldData);
        }
      } catch {
        localStorage.removeItem('athena_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('athena_auth', JSON.stringify(userData));
    setUser(userData);
    setToken('logged-in');
    // Load per-user app data
    const dataKey = getAppDataKey(userData.email);
    const raw = localStorage.getItem(dataKey);
    if (raw) {
      setAppDataState(JSON.parse(raw));
    } else {
      const fresh = getDefaultAppData();
      localStorage.setItem(dataKey, JSON.stringify(fresh));
      setAppDataState(fresh);
    }
  };

  const logout = () => {
    // Save current user's data before logout
    if (user) {
      const dataKey = getAppDataKey(user.email);
      localStorage.setItem(dataKey, JSON.stringify(appData));
    }
    localStorage.removeItem('athena_auth');
    setUser(null);
    setToken(null);
  };

  const updateAppData = useCallback((updater: (prev: StorageAppData) => StorageAppData) => {
    setAppDataState(prev => {
      const next = updater(prev);
      if (user) {
        const dataKey = getAppDataKey(user.email);
        localStorage.setItem(dataKey, JSON.stringify(next));
      }
      return next;
    });
  }, [user]);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};