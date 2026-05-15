/*
 * ATHENA - Student Success Platform
 * Section: AUTH - LOGIN & SIGNUP
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '../types';
import {
  loadData,
  AppData as StorageAppData,
  addXp,
  checkAndUnlockAchievements,
  getDefaultAppData,
  mergeAppDataUser,
} from '../lib/storage';

export type { AuthUser };

const USERS_KEY = 'athena_users';

const DEMO_USERS = [
  { name: 'Admin User', email: 'admin@plasu.edu.ng', password: 'admin123', role: 'admin' as const, studentId: 'ADM001', department: 'Administration' },
  { name: 'Lecturer User', email: 'lecturer@plasu.edu.ng', password: 'lecturer123', role: 'lecturer' as const, studentId: 'LEC001', department: 'Computer Science' },
  { name: 'Student User', email: 'student@plasu.edu.ng', password: 'student123', role: 'student' as const, studentId: 'STU001', department: 'Computer Science' },
];

function seedDemoUsers() {
  if (localStorage.getItem(USERS_KEY)) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
}

function getAppDataKey(email: string): string {
  return `app_data_${email.replace(/[@.]/g, '_')}`;
}

function loadAppDataForUser(authUser: AuthUser): StorageAppData {
  const dataKey = getAppDataKey(authUser.email);
  const raw = localStorage.getItem(dataKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StorageAppData;
      const merged = { ...parsed, user: mergeAppDataUser(authUser, parsed.user) };
      localStorage.setItem(dataKey, JSON.stringify(merged));
      return merged;
    } catch {
      /* fall through */
    }
  }
  const oldData = loadData('app_data', getDefaultAppData());
  const fresh: StorageAppData = {
    ...oldData,
    user: mergeAppDataUser(authUser, oldData.user),
  };
  localStorage.setItem(dataKey, JSON.stringify(fresh));
  return fresh;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
  appData: StorageAppData;
  updateAppData: (updater: (prev: StorageAppData) => StorageAppData) => void;
  addUserXp: (amount: number) => { newlyUnlocked: unknown[] };
  showAchievement: unknown;
  setShowAchievement: (a: unknown) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appData, setAppDataState] = useState<StorageAppData>(getDefaultAppData());
  const [showAchievement, setShowAchievement] = useState<unknown>(null);

  useEffect(() => {
    seedDemoUsers();
    const stored = localStorage.getItem('athena_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
        setToken('logged-in');
        setAppDataState(loadAppDataForUser(parsed));
      } catch {
        localStorage.removeItem('athena_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem('athena_auth', JSON.stringify(userData));
    setUser(userData);
    setToken('logged-in');
    setAppDataState(loadAppDataForUser(userData));
  }, []);

  const logout = useCallback(() => {
    if (user) {
      const dataKey = getAppDataKey(user.email);
      localStorage.setItem(dataKey, JSON.stringify(appData));
    }
    localStorage.removeItem('athena_auth');
    setUser(null);
    setToken(null);
  }, [user, appData]);

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
    let result: unknown[] = [];
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
      showAchievement, setShowAchievement,
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
