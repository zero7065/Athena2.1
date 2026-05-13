import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadData, saveData, getDefaultAppData, AppData, addXp, checkAndUnlockAchievements, UserProfile } from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  isLoading: boolean;
  appData: AppData;
  setAppData: (data: AppData) => void;
  updateAppData: (updater: (prev: AppData) => AppData) => void;
  addUserXp: (amount: number) => { newlyUnlocked: any[] };
  showAchievement: any;
  setShowAchievement: (a: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('athena_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [appData, setAppDataState] = useState<AppData>(getDefaultAppData());
  const [showAchievement, setShowAchievement] = useState<any>(null);

  useEffect(() => {
    if (token === 'local') {
      const stored = loadData('app_data', getDefaultAppData());
      const today = new Date().toISOString().split('T')[0];
      if (stored.user.lastLoginDate !== today) {
        stored.user.streak = stored.user.lastLoginDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
          ? stored.user.streak + 1 : 1;
        stored.user.lastLoginDate = today;
      }
      setAppDataState(stored);
      setUser(stored.user);
      setIsLoading(false);
} else if (token) {
  try {
    let parsed;
    // Check if it's our custom format (base64 encoded JSON) or standard JWT
    if (token.includes('.')) {
      // Standard JWT format: header.payload.signature
      parsed = JSON.parse(atob(token.split('.')[1]));
    } else {
      // Our custom format: base64 encoded JSON
      parsed = JSON.parse(atob(token));
    }
    setUser({
      name: parsed.name || 'Student',
      email: parsed.email || '',
      department: parsed.department || 'Computer Science',
      yearOfStudy: parsed.year || 2,
      xp: parsed.xp || 0,
      level: parsed.level || 1,
      streak: parsed.streak || 0,
      lastLoginDate: '',
      isAdmin: parsed.is_admin || false,
      role: parsed.role || 'student',
    });
    setIsLoading(false);
  } catch {
    setToken(null);
    localStorage.removeItem('athena_token');
    setIsLoading(false);
  }
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const setAppData = useCallback((data: AppData) => {
    setAppDataState(data);
    saveData('app_data', data);
    if (data.user) setUser(data.user);
  }, []);

  const updateAppData = useCallback((updater: (prev: AppData) => AppData) => {
    setAppDataState(prev => {
      const next = updater(prev);
      saveData('app_data', next);
      if (next.user) setUser(next.user);
      return next;
    });
  }, []);

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

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('athena_token', newToken);
    setToken(newToken);
    setUser(newUser);
    if (newToken === 'local') {
      const stored = loadData('app_data', getDefaultAppData());
      stored.user = { ...stored.user, ...newUser };
      saveData('app_data', stored);
      setAppDataState(stored);
    }
  };

  const logout = () => {
    localStorage.removeItem('athena_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, appData, setAppData, updateAppData, addUserXp, showAchievement, setShowAchievement }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
