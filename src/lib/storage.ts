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
  focusScore?: number;
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
  cbtExam: number;
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
  { id: 'first_feedback', title: 'Voice Your Mind', description: 'Submit your first feedback rating', icon: 'Star', unlockedAt: null, requirement: 'Submit 1 feedback' },
  { id: 'five_feedback', title: 'Reviewer', description: 'Submit 5 feedback ratings', icon: 'MessageSquare', unlockedAt: null, requirement: 'Submit 5 feedback ratings' },
  { id: 'rating_5', title: 'Five Stars', description: 'Give a 5-star rating', icon: 'Star', unlockedAt: null, requirement: 'Rate 5 stars' },
  { id: 'support_contact', title: 'Connected', description: 'Contact support via the help button', icon: 'Headphones', unlockedAt: null, requirement: 'Contact support once' },
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
    feedbackCount: 0,
    gaveFiveStar: false,
    contactedSupport: false,
  },
    tasks: [],
    sessions: [],
    pomodoro: { sessionCount: 0, totalSessions: 0, lastDate: '' },
    achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a })),
    friends: [],
    gameScores: { chess: 0, memory: 0, sudoku: 0, artGuesser: 0, cbtExam: 0 },
    adminData: { tasksByStatus: { todo: 0, 'in-progress': 0, done: 0 }, totalXp: 0, gamePlays: { chess: 0, memory: 0, sudoku: 0, artGuesser: 0, cbtExam: 0 } },
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
      case 'first_feedback':
        shouldUnlock = data.user.feedbackCount >= 1;
        break;
      case 'five_feedback':
        shouldUnlock = data.user.feedbackCount >= 5;
        break;
      case 'rating_5':
        shouldUnlock = data.user.gaveFiveStar === true;
        break;
      case 'support_contact':
        shouldUnlock = data.user.contactedSupport === true;
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

export function getUnreadCountFrom(email: string, fromEmail: string): number {
  return getMessages().filter(m => m.toEmail === email && m.fromEmail === fromEmail && !m.read).length;
}

/* ========================================
 * Audit Log — Immutable Activity Trail
 * ======================================== */

export interface AuditEntry {
  id: string;
  timestamp: number;
  userEmail: string;
  userName: string;
  action: string;
  details: string;
  checksum: string;
  readonly marked?: true;
}

const AUDIT_KEY = 'athena_audit';

function hashEntry(e: Omit<AuditEntry, 'checksum' | 'id'> & { id: string }): string {
  let s = `${e.id}|${e.timestamp}|${e.userEmail}|${e.action}|${e.details}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return 'v2_' + Math.abs(h).toString(36);
}

export function logAudit(userEmail: string, userName: string, action: string, details: string) {
  const all = getAuditLog();
  const entry: AuditEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
    userEmail,
    userName,
    action,
    details,
    checksum: '',
  };
  entry.checksum = hashEntry(entry);
  all.push(entry);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(all));
}

export function getAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function verifyAuditLog(): { valid: boolean; tampered: AuditEntry[] } {
  const all = getAuditLog();
  const tampered: AuditEntry[] = [];
  for (const e of all) {
    const { checksum, ...rest } = e;
    const expected = hashEntry(rest as any);
    if (checksum !== expected) {
      tampered.push(e);
    }
  }
  return { valid: tampered.length === 0, tampered };
}

/* ========================================
 * Feedback / Ratings System
 * ======================================== */

export interface FeedbackEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  comment: string;
  category: string;
  createdAt: number;
}

const FEEDBACK_KEY = 'athena_feedback';

export function submitFeedback(fb: FeedbackEntry) {
  const all = getFeedback();
  all.push(fb);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
}

export function getFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getUserFeedback(email: string): FeedbackEntry[] {
  return getFeedback().filter(f => f.userEmail === email);
}

export function getFeedbackStats() {
  const all = getFeedback();
  if (all.length === 0) return { total: 0, avg: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const f of all) {
    dist[f.rating] = (dist[f.rating] || 0) + 1;
    sum += f.rating;
  }
  return { total: all.length, avg: Math.round((sum / all.length) * 10) / 10, distribution: dist };
}

/* ========================================
 * Support / Contact Settings
 * ======================================== */

export interface SupportSettings {
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  phone: string;
  enabled: boolean;
}

const SUPPORT_KEY = 'athena_support_settings';

export function getSupportSettings(): SupportSettings {
  try {
    const raw = localStorage.getItem(SUPPORT_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  return {
    whatsappNumber: '+2348000000000',
    whatsappMessage: 'Hello%20ATHENA%20Support%2C%20I%20need%20help%20with...',
    email: 'athena@plasu.edu.ng',
    phone: '+234-800-ATHENA',
    enabled: true,
  };
}

export function saveSupportSettings(s: SupportSettings) {
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(s));
}

/* ========================================
 * Activity Feed — User-Facing Timeline
 * ======================================== */

export interface ActivityEntry {
  id: string;
  timestamp: number;
  userEmail: string;
  userName: string;
  action: string;
  details: string;
  icon: string; // lucide icon name
}

const ACTIVITY_KEY = 'athena_activity';

export function logActivity(userEmail: string, userName: string, action: string, details: string, icon: string = 'Sparkles') {
  const all = getActivities();
  const entry: ActivityEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
    userEmail,
    userName,
    action,
    details,
    icon,
  };
  all.unshift(entry);
  if (all.length > 100) all.length = 100;
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(all));
}

export function getActivities(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getUserActivities(email: string, limit: number = 20): ActivityEntry[] {
  return getActivities().filter(a => a.userEmail === email).slice(0, limit);
}

export function seedActivityLog() {
  if (localStorage.getItem('athena_activity')) return;
  const entries: ActivityEntry[] = [
    { id: 'a1', timestamp: Date.now() - 60000, userEmail: 'student1@plasu.edu.ng', userName: 'Jehu Nanpan Luke', action: 'submitted assignment', details: 'CSC301 - Data Structures Assignment 1', icon: 'CheckSquare' },
    { id: 'a2', timestamp: Date.now() - 180000, userEmail: 'student2@plasu.edu.ng', userName: 'Amina Bello', action: 'completed study session', details: '25 min focus session - Mathematics', icon: 'Timer' },
    { id: 'a3', timestamp: Date.now() - 300000, userEmail: 'lecturer1@plasu.edu.ng', userName: 'Dr. Chukwuma Okoro', action: 'posted new assignment', details: 'CSC401 - Algorithm Analysis Due 15/07', icon: 'BookOpen' },
    { id: 'a4', timestamp: Date.now() - 600000, userEmail: 'student3@plasu.edu.ng', userName: 'John Musa', action: 'earned achievement', details: 'Task Master - 5 tasks completed', icon: 'Trophy' },
    { id: 'a5', timestamp: Date.now() - 900000, userEmail: 'student4@plasu.edu.ng', userName: 'Grace Okon', action: 'won chess game', details: 'Defeated AI on Medium difficulty', icon: 'Gamepad2' },
    { id: 'a6', timestamp: Date.now() - 1800000, userEmail: 'student1@plasu.edu.ng', userName: 'Jehu Nanpan Luke', action: 'completed CBT exam', details: 'Mathematics - Score: 85%', icon: 'Brain' },
    { id: 'a7', timestamp: Date.now() - 3600000, userEmail: 'student5@plasu.edu.ng', userName: 'Samuel Obi', action: 'joined study room', details: 'CSC301 Group Discussion', icon: 'Users' },
    { id: 'a8', timestamp: Date.now() - 7200000, userEmail: 'lecturer2@plasu.edu.ng', userName: 'Prof. Fatima Ali', action: 'graded submissions', details: 'MTH201 - 12 assignments graded', icon: 'CheckCircle2' },
  ];
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries));
}
