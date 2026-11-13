/*
 * CampusIQ - Student Success Platform
 * Section: AUTH - LOGIN & SIGNUP
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, ManagementRequest } from '../types';
import {
  loadData,
  AppData as StorageAppData,
  addXp,
  checkAndUnlockAchievements,
  getDefaultAppData,
  mergeAppDataUser,
} from '../lib/storage';

export type { AuthUser, ManagementRequest };

const USERS_KEY = 'unipulse_users';
const KNOWN_ACCOUNTS_KEY = 'unipulse_known_accounts';
const AUTH_KEY = 'unipulse_auth';
const MANAGEMENT_REQUESTS_KEY = 'unipulse_management_requests';

function seedDemoUsers() {
  if (localStorage.getItem(USERS_KEY)) return;
  localStorage.setItem(USERS_KEY, JSON.stringify([
    { name: 'Admin User', email: 'admin@unipulse.io', password: 'admin123', role: 'admin' as const, studentId: 'ADM001', department: 'Administration' },
    { name: 'Lecturer User', email: 'lecturer@unipulse.io', password: 'lecturer123', role: 'lecturer' as const, studentId: 'LEC001', department: 'Computer Science' },
    { name: 'Student User', email: 'student@unipulse.io', password: 'student123', role: 'student' as const, studentId: 'STU001', department: 'Computer Science' },
  ]));
}

interface StoredUser {
  email: string;
  password: string;
  name: string;
  studentId: string;
  department: string;
  role: 'student' | 'lecturer' | 'admin' | 'management';
}

function getStoredUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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
    seedDemoUsers();
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
        setToken('logged-in');
        setAppDataState(loadAppDataForUser(parsed));
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    setUser(userData);
    setToken('logged-in');
    const data = loadAppDataForUser(userData);
    setAppDataState(data);
    saveKnownAccount(userData);
  }, [saveKnownAccount]);

  const logout = useCallback(() => {
    if (user) {
      const dataKey = getAppDataKey(user.email);
      localStorage.setItem(dataKey, JSON.stringify(appData));
    }
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setToken(null);
  }, [user, appData]);

  const switchAccount = useCallback(() => {
    if (user) {
      const dataKey = getAppDataKey(user.email);
      localStorage.setItem(dataKey, JSON.stringify(appData));
    }
    localStorage.removeItem(AUTH_KEY);
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
      const request = prev[idx];
      const authUser: AuthUser = {
        name: `Management - ${request.email.split('@')[0]}`,
        email: request.email,
        studentId: `MGMT${Date.now().toString(36).slice(0, 6)}`,
        role: 'management' as const,
        department: 'Management',
      };
      const users = getStoredUsers();
      const alreadyExists = users.some(u => u.email === request.email);
      if (!alreadyExists) {
        users.push({ ...authUser, password: 'management123', department: 'Management' });
        saveStoredUsers(users);
      }
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
    user, token, login, logout, switchAccount, knownAccounts, isLoading,
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
