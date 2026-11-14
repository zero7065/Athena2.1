/*
 * AcademiaIQ - Student Success Platform
 * Section: AUTH - LOGIN & SIGNUP
 * Backend-integrated authentication with JWT tokens
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, ManagementRequest } from '../types';
import {
  AppData as StorageAppData,
  addXp,
  checkAndUnlockAchievements,
  getDefaultAppData,
  mergeAppDataUser,
} from '../lib/storage';
import { api } from '../lib/api';

export type { AuthUser, ManagementRequest };

const AUTH_KEY = 'unipulse_auth';
const KNOWN_ACCOUNTS_KEY = 'unipulse_known_accounts';
const MANAGEMENT_REQUESTS_KEY = 'unipulse_management_requests';

function getAppDataKey(email: string): string {
  return `app_data_${email.replace(/[@.]/g, '_')}`;
}

function loadAppDataLocally(authUser: AuthUser): StorageAppData {
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
  const fresh: StorageAppData = {
    ...getDefaultAppData(),
    user: mergeAppDataUser(authUser, getDefaultAppData().user),
  };
  localStorage.setItem(dataKey, JSON.stringify(fresh));
  return fresh;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  register: (data: { email: string; password: string; name: string; role?: string; department?: string; student_id?: string }) => Promise<void>;
  logout: () => void;
  switchAccount: () => void;
  knownAccounts: AuthUser[];
  isLoading: boolean;
  appData: StorageAppData;
  updateAppData: (updater: (prev: StorageAppData) => StorageAppData) => void;
  addUserXp: (amount: number) => { newlyUnlocked: unknown[] };
  showAchievement: unknown;
  setShowAchievement: (a: unknown) => void;
  adminClickCount: number;
  setAdminClickCount: (count: number) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  managementRequests: ManagementRequest[];
  setManagementRequests: (requests: ManagementRequest[]) => void;
  addManagementRequest: (email: string) => void;
  approveManagementRequest: (id: string) => void;
  rejectManagementRequest: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appData, setAppDataState] = useState<StorageAppData>(getDefaultAppData());
  const [showAchievement, setShowAchievement] = useState<unknown>(null);
  const [adminClickCount, setAdminClickCount] = useState<number>(0);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [managementRequests, setManagementRequests] = useState<ManagementRequest[]>(() => {
    try {
      const stored = localStorage.getItem(MANAGEMENT_REQUESTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [knownAccounts, setKnownAccounts] = useState<AuthUser[]>([]);

  const saveKnownAccount = useCallback((authUser: AuthUser) => {
    setKnownAccounts(prev => {
      const exists = prev.some(a => a.email === authUser.email);
      if (exists) return prev;
      const updated = [...prev, authUser];
      localStorage.setItem(KNOWN_ACCOUNTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem(AUTH_KEY);
        if (stored && mounted) {
          const parsed = JSON.parse(stored) as { token: string; user: AuthUser };
          setToken(parsed.token);
          setUser(parsed.user);
          setAppDataState(loadAppDataLocally(parsed.user));
        }
      } catch {
        localStorage.removeItem(AUTH_KEY);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    initAuth();
    return () => { mounted = false; };
  }, []);

  const login = useCallback((userData: AuthUser, authToken: string) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token: authToken, user: userData }));
    setUser(userData);
    setToken(authToken);
    const data = loadAppDataLocally(userData);
    setAppDataState(data);
    saveKnownAccount(userData);
  }, [saveKnownAccount]);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
    student_id?: string;
  }) => {
    const result = await api.authRegister(data);
    // result contains { token, user }
    login(result.user, result.token);
    saveKnownAccount(result.user);
  }, [login, saveKnownAccount]);

  const logout = useCallback(() => {
    if (user) {
      const dataKey = getAppDataKey(user.email);
      localStorage.setItem(dataKey, JSON.stringify(appData));
    }
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setToken(null);
    setAppDataState(getDefaultAppData());
  }, [user, appData]);

  const switchAccount = useCallback(() => {
    if (user) {
      const dataKey = getAppDataKey(user.email);
      localStorage.setItem(dataKey, JSON.stringify(appData));
    }
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setToken(null);
    setAppDataState(getDefaultAppData());
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

  const addManagementRequest = useCallback((email: string) => {
    const newRequest: ManagementRequest = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      email,
      requestedAt: Date.now(),
      status: 'pending',
    };
    setManagementRequests(prev => {
      const exists = prev.some(r => r.email === email);
      if (exists) return prev;
      const updated = [...prev, newRequest];
      localStorage.setItem(MANAGEMENT_REQUESTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const approveManagementRequest = useCallback((id: string) => {
    setManagementRequests(prev => {
      const idx = prev.findIndex(r => r.id === id);
      if (idx < 0) return prev;
      const updatedRequests = prev.filter(r => r.id !== id);
      localStorage.setItem(MANAGEMENT_REQUESTS_KEY, JSON.stringify(updatedRequests));
      return updatedRequests;
    });
  }, []);

  const rejectManagementRequest = useCallback((id: string) => {
    setManagementRequests(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem(MANAGEMENT_REQUESTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value: AuthContextType = {
    user, token, login, register, logout, switchAccount, knownAccounts, isLoading,
    appData, updateAppData, addUserXp,
    showAchievement, setShowAchievement,
    adminClickCount, setAdminClickCount,
    showTerminal, setShowTerminal,
    managementRequests, setManagementRequests,
    addManagementRequest, approveManagementRequest, rejectManagementRequest,
  };

  return (
    <AuthContext.Provider value={value}>
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
