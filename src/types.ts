export type UserRole = 'student' | 'lecturer' | 'admin';
export type AIPersonality = 'charming' | 'strict' | 'sarcastic' | 'zen';
export type FontPreference = 'sans' | 'mono' | 'serif';

/** Minimal identity from login / signup */
export interface AuthUser {
  name: string;
  email: string;
  studentId: string;
  role: UserRole;
  department?: string;
}

/** Full profile stored in appData.user (auth + gamification + preferences) */
export interface UserProfile extends AuthUser {
  yearOfStudy: number;
  xp: number;
  level: number;
  streak: number;
  themeColor: string;
  fontPreference: FontPreference;
  aiPersonality: AIPersonality;
  isAnonymous: boolean;
  isAdmin: boolean;
  lastLoginDate: string;
  bio?: string;
  avatar_url?: string;
}

export interface StoredUser extends AuthUser {
  password: string;
}

export interface LocalTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: number;
  assignedTo?: string;
}

export interface LocalSession {
  id: string;
  date: number;
  duration: number;
  subject: string;
}

export interface LocalAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  requirement: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
