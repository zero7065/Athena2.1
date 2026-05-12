export interface User {
  id: number;
  email: string;
  name: string;
  department: string;
  year_of_study: number;
  bio?: string;
  avatar_url?: string;
  theme_color: string;
  ai_personality: 'strict' | 'charming' | 'sarcastic' | 'zen';
  font_preference: 'sans' | 'mono' | 'serif';
  is_admin: boolean;
  role: 'student' | 'lecturer' | 'admin';
  title?: string;
  subscription_tier: 'basic' | 'pro' | 'enterprise';
  is_anonymous: boolean;
  streak: number;
  xp: number;
  level: number;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  status: 'todo' | 'in-progress' | 'done';
}

export interface Session {
  id: number;
  user_id: number;
  subject: string;
  duration: number;
  focus_score: number;
  created_at: string;
}

export interface Achievement {
  id: number;
  user_id: number;
  title: string;
  description: string;
  unlocked_at: string;
}

export interface Insight {
  id: number;
  user_id: number;
  content: string;
  type: 'strength' | 'weakness' | 'prediction' | 'nag';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted';
  name?: string;
  avatar_url?: string;
  is_anonymous?: boolean;
  level?: number;
  department?: string;
}
