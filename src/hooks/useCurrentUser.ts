import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../types';

/** Returns the unified profile from appData (xp, theme, streak, etc.) */
export function useCurrentUser(): UserProfile | null {
  const { user, appData } = useAuth();
  if (!user) return null;
  return appData.user;
}
