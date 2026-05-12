/* localStorage persistence layer with namespace prefix, corruption handling, and defaults */

const PREFIX = 'athena_';

export function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch {
    localStorage.removeItem(PREFIX + key);
    return fallback;
  }
}

export function saveData<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded');
    }
    return false;
  }
}

export function removeData(key: string) {
  try { localStorage.removeItem(PREFIX + key); } catch { /* noop */ }
}

/* --- App-specific types --- */

export interface LocalTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: number;
}

export interface LocalSession {
  id: string;
  date: number;
  duration: number;
  subject: string;
}

export interface LocalPomodoro {
  sessionCount: number;
  totalSessions: number;
  lastDate: string;
}

export interface LocalAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  requirement: string;
}

export interface LocalFriend {
  id: string;
  name: string;
  department: string;
  level: number;
  online: boolean;
}

export interface LocalGameScore {
  chess: number;
  memory: number;
  sudoku: number;
  artGuesser: number;
}

export interface UserProfile {
  name: string;
  email: string;
  department: string;
  yearOfStudy: number;
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string;
  isAdmin: boolean;
  role: 'student' | 'lecturer' | 'admin';
  themeColor: string;
  fontPreference: 'sans' | 'mono' | 'serif';
  aiPersonality: 'charming' | 'strict' | 'sarcastic' | 'zen';
  isAnonymous: boolean;
}

export interface AppData {
  user: UserProfile;
  tasks: LocalTask[];
  sessions: LocalSession[];
  pomodoro: LocalPomodoro;
  achievements: LocalAchievement[];
  friends: LocalFriend[];
  gameScores: LocalGameScore;
  adminData: {
    tasksByStatus: Record<string, number>;
    totalXp: number;
    gamePlays: Record<string, number>;
  };
}

const DEFAULT_ACHIEVEMENTS: LocalAchievement[] = [
  { id: 'first_task', title: 'First Step', description: 'Complete your first task', icon: 'CheckSquare', unlockedAt: null, requirement: 'Complete 1 task' },
  { id: 'five_tasks', title: 'Task Master', description: 'Complete 5 tasks', icon: 'Target', unlockedAt: null, requirement: 'Complete 5 tasks' },
  { id: 'ten_tasks', title: 'Productivity Guru', description: 'Complete 10 tasks', icon: 'Zap', unlockedAt: null, requirement: 'Complete 10 tasks' },
  { id: 'first_pomodoro', title: 'Focus Starter', description: 'Complete your first Pomodoro session', icon: 'Timer', unlockedAt: null, requirement: 'Complete 1 Pomodoro session' },
  { id: 'five_pomodoro', title: 'Focus Champion', description: 'Complete 5 Pomodoro sessions', icon: 'Clock', unlockedAt: null, requirement: 'Complete 5 Pomodoro sessions' },
  { id: 'streak_3', title: 'Consistent', description: 'Maintain a 3-day streak', icon: 'Flame', unlockedAt: null, requirement: '3-day login streak' },
  { id: 'streak_7', title: 'Dedicated', description: 'Maintain a 7-day streak', icon: 'Star', unlockedAt: null, requirement: '7-day login streak' },
  { id: 'win_chess', title: 'Chess Novice', description: 'Win your first chess game', icon: 'Trophy', unlockedAt: null, requirement: 'Win 1 chess game' },
  { id: 'win_memory', title: 'Memory Ace', description: 'Complete a Memory Match game', icon: 'Brain', unlockedAt: null, requirement: 'Complete 1 Memory Match game' },
  { id: 'win_sudoku', title: 'Sudoku Solver', description: 'Complete a Sudoku puzzle', icon: 'Grid3X3', unlockedAt: null, requirement: 'Complete 1 Sudoku puzzle' },
  { id: 'xp_100', title: 'Apprentice', description: 'Earn 100 XP', icon: 'Award', unlockedAt: null, requirement: 'Earn 100 XP' },
  { id: 'xp_500', title: 'Scholar', description: 'Earn 500 XP', icon: 'GraduationCap', unlockedAt: null, requirement: 'Earn 500 XP' },
  { id: 'xp_1000', title: 'Professor', description: 'Earn 1000 XP', icon: 'Award', unlockedAt: null, requirement: 'Earn 1000 XP' },
  { id: 'three_games', title: 'Gamer', description: 'Play 3 different games', icon: 'Gamepad2', unlockedAt: null, requirement: 'Play 3 different game types' },
];

export function getDefaultAppData(): AppData {
  return {
  user: {
    name: 'Demo Student',
    email: 'demo@plasu.edu.ng',
    department: 'Computer Science',
    yearOfStudy: 2,
    xp: 0,
    level: 1,
    streak: 0,
    lastLoginDate: new Date().toISOString().split('T')[0],
    isAdmin: true,
    role: 'student',
    themeColor: '#00843D',
    fontPreference: 'sans',
    aiPersonality: 'charming',
    isAnonymous: false,
  },
    tasks: [],
    sessions: [],
    pomodoro: { sessionCount: 0, totalSessions: 0, lastDate: '' },
    achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a })),
    friends: [],
    gameScores: { chess: 0, memory: 0, sudoku: 0, artGuesser: 0 },
    adminData: { tasksByStatus: { todo: 0, 'in-progress': 0, done: 0 }, totalXp: 0, gamePlays: { chess: 0, memory: 0, sudoku: 0, artGuesser: 0 } },
  };
}

export function calcLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * level * 50;
}

export function checkAndUnlockAchievements(data: AppData): { data: AppData; newlyUnlocked: LocalAchievement[] } {
  const newlyUnlocked: LocalAchievement[] = [];
  const updated = { ...data, achievements: data.achievements.map(a => {
    if (a.unlockedAt !== null) return a;
    let shouldUnlock = false;
    switch (a.id) {
      case 'first_task':
        shouldUnlock = data.tasks.filter(t => t.status === 'done').length >= 1;
        break;
      case 'five_tasks':
        shouldUnlock = data.tasks.filter(t => t.status === 'done').length >= 5;
        break;
      case 'ten_tasks':
        shouldUnlock = data.tasks.filter(t => t.status === 'done').length >= 10;
        break;
      case 'first_pomodoro':
        shouldUnlock = data.pomodoro.totalSessions >= 1;
        break;
      case 'five_pomodoro':
        shouldUnlock = data.pomodoro.totalSessions >= 5;
        break;
      case 'streak_3':
        shouldUnlock = data.user.streak >= 3;
        break;
      case 'streak_7':
        shouldUnlock = data.user.streak >= 7;
        break;
      case 'win_chess':
        shouldUnlock = data.gameScores.chess >= 1;
        break;
      case 'win_memory':
        shouldUnlock = data.gameScores.memory >= 1;
        break;
      case 'win_sudoku':
        shouldUnlock = data.gameScores.sudoku >= 1;
        break;
      case 'xp_100':
        shouldUnlock = data.user.xp >= 100;
        break;
      case 'xp_500':
        shouldUnlock = data.user.xp >= 500;
        break;
      case 'xp_1000':
        shouldUnlock = data.user.xp >= 1000;
        break;
      case 'three_games':
        shouldUnlock = Object.values(data.gameScores).filter(v => v > 0).length >= 3;
        break;
    }
    if (shouldUnlock) {
      const unlocked = { ...a, unlockedAt: Date.now() };
      newlyUnlocked.push(unlocked);
      return unlocked;
    }
    return a;
  })};
  return { data: updated, newlyUnlocked };
}

export function addXp(data: AppData, amount: number): AppData {
  const updated = { ...data, user: { ...data.user, xp: data.user.xp + amount } };
  updated.user.level = calcLevel(updated.user.xp);
  return updated;
}
