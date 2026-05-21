/* localStorage persistence layer with namespace prefix, corruption handling, and defaults */

import type { AuthUser, UserProfile } from '../types';

const PREFIX = 'athena_';

export type { UserProfile };

export function mergeAppDataUser(auth: AuthUser, existing: UserProfile): UserProfile {
  return {
    ...existing,
    name: auth.name,
    email: auth.email,
    studentId: auth.studentId,
    role: auth.role,
    department: auth.department ?? existing.department,
    isAdmin: auth.role === 'admin',
  };
}

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
  assignedTo?: string;
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
  studentId?: string;
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
    studentId: 'STU000',
    department: 'Computer Science',
    yearOfStudy: 2,
    xp: 0,
    level: 1,
    streak: 0,
    lastLoginDate: new Date().toISOString().split('T')[0],
    isAdmin: false,
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

/* ========================================
 * Shared Submissions System (lecturer-student)
 * ======================================== */

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  assignmentId?: string;
  assignmentTitle: string;
  description: string;
  status: 'draft' | 'submitted' | 'graded';
  score: number;
  feedback: string;
  submittedAt: number;
  gradedAt: number | null;
  autoSubmitAt?: number; // timestamp when it auto-submits
  draftSavedAt?: number; // timestamp when draft was last saved
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  createdBy: string; // lecturer email
  createdAt: number;
}

// Shared storage key (no PREFIX — always exact key)
const SUBMISSIONS_KEY = 'athena_submissions';
const ASSIGNMENTS_KEY = 'athena_assignments';

export function getSubmissions(): Submission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveSubmission(submission: Submission) {
  const all = getSubmissions();
  const idx = all.findIndex(s => s.id === submission.id);
  if (idx >= 0) {
    all[idx] = submission;
  } else {
    all.push(submission);
  }
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
}

export function deleteSubmission(id: string) {
  const all = getSubmissions().filter(s => s.id !== id);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
}

export function getStudentSubmissions(studentEmail: string): Submission[] {
  return getSubmissions().filter(s => s.studentEmail === studentEmail);
}

export function getAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveAssignment(assignment: Assignment) {
  const all = getAssignments();
  const idx = all.findIndex(a => a.id === assignment.id);
  if (idx >= 0) {
    all[idx] = assignment;
  } else {
    all.push(assignment);
  }
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(all));
}

export function deleteAssignment(id: string) {
  const all = getAssignments().filter(a => a.id !== id);
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(all));
}

/* ========================================
 * Study Rooms System
 * ======================================== */

export interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  code: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: number;
  description: string;
  members: RoomMember[];
  announcements: Announcement[];
}

export interface RoomMember {
  name: string;
  email: string;
  studentId: string;
  role: 'lecturer' | 'student';
  joinedAt: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorEmail: string;
  createdAt: number;
}

const ROOMS_KEY = 'athena_rooms';

export function getRooms(): StudyRoom[] {
  try {
    const raw = localStorage.getItem(ROOMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveRoom(room: StudyRoom) {
  const all = getRooms();
  const idx = all.findIndex(r => r.id === room.id);
  if (idx >= 0) {
    all[idx] = room;
  } else {
    all.push(room);
  }
  localStorage.setItem(ROOMS_KEY, JSON.stringify(all));
}

export function deleteRoom(id: string) {
  const all = getRooms().filter(r => r.id !== id);
  localStorage.setItem(ROOMS_KEY, JSON.stringify(all));
}

export function getRoomByCode(code: string): StudyRoom | undefined {
  return getRooms().find(r => r.code === code);
}

export function getUserRooms(email: string): StudyRoom[] {
  return getRooms().filter(r => r.members.some(m => m.email === email));
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/* ========================================
 * Direct Messaging System
 * ======================================== */

export interface DirectMessage {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  toEmail: string;
  text: string;
  timestamp: number;
  read: boolean;
}

const MESSAGES_KEY = 'athena_messages';

export function getMessages(): DirectMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function sendMessage(msg: DirectMessage) {
  const all = getMessages();
  all.push(msg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
}

export function getUserMessages(email: string): DirectMessage[] {
  return getMessages().filter(m => m.fromEmail === email || m.toEmail === email)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getConversation(email1: string, email2: string): DirectMessage[] {
  return getMessages().filter(m =>
    (m.fromEmail === email1 && m.toEmail === email2) ||
    (m.fromEmail === email2 && m.toEmail === email1)
  ).sort((a, b) => a.timestamp - b.timestamp);
}

export function markMessagesRead(email: string, fromEmail: string) {
  const all = getMessages();
  all.forEach(m => {
    if (m.toEmail === email && m.fromEmail === fromEmail) {
      m.read = true;
    }
  });
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
}

export function getUnreadCount(email: string): number {
  return getMessages().filter(m => m.toEmail === email && !m.read).length;
}
