/* localStorage persistence layer with namespace prefix, corruption handling, and defaults */

import type { AuthUser, UserProfile, ContentResource, Syllabus, Course } from '../types';

const PREFIX = 'unipulse_';

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
    email: 'demo@unipulse.io',
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
const SUBMISSIONS_KEY = 'unipulse_submissions';
const ASSIGNMENTS_KEY = 'unipulse_assignments';

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

const ROOMS_KEY = 'unipulse_rooms';

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

const MESSAGES_KEY = 'unipulse_messages';

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

const AUDIT_KEY = 'unipulse_audit';

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

const FEEDBACK_KEY = 'unipulse_feedback';

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

const SUPPORT_KEY = 'unipulse_support_settings';

export function getSupportSettings(): SupportSettings {
  try {
    const raw = localStorage.getItem(SUPPORT_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  return {
    whatsappNumber: '+2348000000000',
    whatsappMessage: 'Hello%20UniPulse%20Support%2C%20I%20need%20help%20with...',
    email: 'support@unipulse.io',
    phone: '+234-800-AcademiaIQ',
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

const ACTIVITY_KEY = 'unipulse_activity';

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
  if (localStorage.getItem('unipulse_activity')) return;
  const entries: ActivityEntry[] = [
    { id: 'a1', timestamp: Date.now() - 60000, userEmail: 'student1@unipulse.io', userName: 'Jehu Nanpan Luke', action: 'submitted assignment', details: 'CSC301 - Data Structures Assignment 1', icon: 'CheckSquare' },
    { id: 'a2', timestamp: Date.now() - 180000, userEmail: 'student2@unipulse.io', userName: 'Amina Bello', action: 'completed study session', details: '25 min focus session - Mathematics', icon: 'Timer' },
    { id: 'a3', timestamp: Date.now() - 300000, userEmail: 'lecturer1@unipulse.io', userName: 'Dr. Chukwuma Okoro', action: 'posted new assignment', details: 'CSC401 - Algorithm Analysis Due 15/07', icon: 'BookOpen' },
    { id: 'a4', timestamp: Date.now() - 600000, userEmail: 'student3@unipulse.io', userName: 'John Musa', action: 'earned achievement', details: 'Task Master - 5 tasks completed', icon: 'Trophy' },
    { id: 'a5', timestamp: Date.now() - 900000, userEmail: 'student4@unipulse.io', userName: 'Grace Okon', action: 'won chess game', details: 'Defeated AI on Medium difficulty', icon: 'Gamepad2' },
    { id: 'a6', timestamp: Date.now() - 1800000, userEmail: 'student1@unipulse.io', userName: 'Jehu Nanpan Luke', action: 'completed CBT exam', details: 'Mathematics - Score: 85%', icon: 'Brain' },
    { id: 'a7', timestamp: Date.now() - 3600000, userEmail: 'student5@unipulse.io', userName: 'Samuel Obi', action: 'joined study room', details: 'CSC301 Group Discussion', icon: 'Users' },
    { id: 'a8', timestamp: Date.now() - 7200000, userEmail: 'lecturer2@unipulse.io', userName: 'Prof. Fatima Ali', action: 'graded submissions', details: 'MTH201 - 12 assignments graded', icon: 'CheckCircle2' },
  ];
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries));
}


/* ========================================
 * Content Library — Learning Resources
 * ======================================== */

export function getContentResources(): ContentResource[] {
  try {
    const raw = localStorage.getItem(PREFIX + 'content_resources');
    const existing = raw ? JSON.parse(raw) : [];
    if (existing.length > 0) return existing;
  } catch { /* fall through to seed defaults */ }
  const seeded = [...DEFAULT_CONTENT_RESOURCES];
  saveContentResourcesSilent(seeded);
  return seeded;
}

function saveContentResourcesSilent(resources: ContentResource[]): ContentResource[] {
  try {
    localStorage.setItem(PREFIX + 'content_resources', JSON.stringify(resources));
  } catch { /* noop */ }
  return resources;
}

export function saveContentResource(resource: ContentResource): ContentResource[] {
  const all = getContentResources();
  const idx = all.findIndex(x => x.id === resource.id);
  if (idx >= 0) all[idx] = resource; else all.push(resource);
  localStorage.setItem(PREFIX + 'content_resources', JSON.stringify(all));
  return all;
}

export function deleteContentResource(id: string): ContentResource[] {
  const all = getContentResources().filter(x => x.id !== id);
  localStorage.setItem(PREFIX + 'content_resources', JSON.stringify(all));
  return all;
}

/* ========================================
 * Course Syllabi
 * ======================================== */

export function getSyllabi(): Syllabus[] {
  try {
    const raw = localStorage.getItem(PREFIX + 'syllabi');
    const existing = raw ? JSON.parse(raw) : [];
    if (existing.length > 0) return existing;
  } catch { /* fall through to seed defaults */ }
  const seeded = [...DEFAULT_SYLLABI];
  saveSyllabiSilent(seeded);
  return seeded;
}

function saveSyllabiSilent(syllabi: Syllabus[]): Syllabus[] {
  try {
    localStorage.setItem(PREFIX + 'syllabi', JSON.stringify(syllabi));
  } catch { /* noop */ }
  return syllabi;
}

export function saveSyllabus(syllabus: Syllabus): Syllabus[] {
  const all = getSyllabi();
  const idx = all.findIndex(x => x.id === syllabus.id);
  if (idx >= 0) all[idx] = syllabus; else all.push(syllabus);
  localStorage.setItem(PREFIX + 'syllabi', JSON.stringify(all));
  return all;
}

export function deleteSyllabus(id: string): Syllabus[] {
  const all = getSyllabi().filter(x => x.id !== id);
  localStorage.setItem(PREFIX + 'syllabi', JSON.stringify(all));
  return all;
}

/* ===== Course / Curriculum storage ===== */
export function getAllCourses(): Course[] {
  try {
    const raw = localStorage.getItem(PREFIX + 'courses');
    if (!raw) return [];
    const existing = JSON.parse(raw) as Course[];
    if (existing.length > 0) return existing;
  } catch { /* fall through to seed defaults */ }
  const seeded = [...DEFAULT_COURSES];
  saveCoursesSilent(seeded);
  return seeded;
}

function saveCoursesSilent(courses: Course[]): Course[] {
  try {
    localStorage.setItem(PREFIX + 'courses', JSON.stringify(courses));
  } catch { return courses; }
  return courses;
}

export function saveCourses(courses: Course[]): Course[] {
  try {
    localStorage.setItem(PREFIX + 'courses', JSON.stringify(courses));
    return courses;
  } catch { return courses; }
}

export function addCourse(course: Course): Course[] {
  const all = getAllCourses();
  const idx = all.findIndex(x => x.id === course.id);
  if (idx >= 0) all[idx] = course; else all.push(course);
  saveCourses(all);
  return all;
}

export function deleteCourse(id: string): Course[] {
  const all = getAllCourses().filter(x => x.id !== id);
  saveCourses(all);
  return all;
}

export interface StudentEnrollment {
  courseId: string;
  studentEmail: string;
  enrolledAt: number;
}

export function getStudentEnrollments(studentEmail: string): StudentEnrollment[] {
  try {
    const raw = localStorage.getItem(PREFIX + 'enrollments');
    if (!raw) return [];
    return JSON.parse(raw) as StudentEnrollment[];
  } catch { return []; }
}

export function saveStudentEnrollments(enrollments: StudentEnrollment[]): boolean {
  try {
    localStorage.setItem(PREFIX + 'enrollments', JSON.stringify(enrollments));
    return true;
  } catch { return false; }
}

export function enrollStudent(courseId: string, studentEmail: string): boolean {
  const all = getStudentEnrollments(studentEmail);
  if (all.some(e => e.courseId === courseId)) return false;
  const next = [...all, { courseId, studentEmail, enrolledAt: Date.now() }];
  return saveStudentEnrollments(next);
}

export function unenrollStudent(courseId: string, studentEmail: string): boolean {
  const all = getStudentEnrollments(studentEmail).filter(e => e.courseId !== courseId);
  return saveStudentEnrollments(all);
}

/* ========================================
 * Skill Progress Tracking
 * ======================================== */

export interface SkillProgress {
  id: string;
  name: string;
  category: string;
  level: number; // 1-5
  xp: number; // 0-100 per level
  learnedAt?: number;
  lastPracticed?: number;
}

const SKILLS_KEY = PREFIX + 'skills';

export const DEFAULT_SKILLS: SkillProgress[] = [
  { id: 'skill_js', name: 'JavaScript', category: 'Programming', level: 1, xp: 0 },
  { id: 'skill_ts', name: 'TypeScript', category: 'Programming', level: 1, xp: 0 },
  { id: 'skill_react', name: 'React', category: 'Programming', level: 1, xp: 0 },
  { id: 'skill_css', name: 'CSS & Styling', category: 'Programming', level: 1, xp: 0 },
  { id: 'skill_git', name: 'Git & Version Control', category: 'Tools', level: 1, xp: 0 },
  { id: 'skill_calculus', name: 'Calculus', category: 'Mathematics', level: 1, xp: 0 },
  { id: 'skill_algebra', name: 'Algebra', category: 'Mathematics', level: 1, xp: 0 },
  { id: 'skill_mechanics', name: 'Classical Mechanics', category: 'Physics', level: 1, xp: 0 },
  { id: 'skill_energy', name: 'Energy & Thermodynamics', category: 'Physics', level: 1, xp: 0 },
  { id: 'skill_chemistry', name: 'Chemical Bonding', category: 'Chemistry', level: 1, xp: 0 },
  { id: 'skill_genetics', name: 'Genetics', category: 'Biology', level: 1, xp: 0 },
  { id: 'skill_ecology', name: 'Ecology', category: 'Biology', level: 1, xp: 0 },
  { id: 'skill_writing', name: 'Academic Writing', category: 'Communication', level: 1, xp: 0 },
  { id: 'skill_research', name: 'Research Methods', category: 'Communication', level: 1, xp: 0 },
  { id: 'skill_citation', name: 'Citation Styles (APA/MLA)', category: 'Communication', level: 1, xp: 0 },
];

export function getSkillProgress(): SkillProgress[] {
  try {
    const raw = localStorage.getItem(SKILLS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    if (existing.length > 0) return existing;
  } catch { /* fall through to seed defaults */ }
  const seeded = [...DEFAULT_SKILLS];
  try { localStorage.setItem(SKILLS_KEY, JSON.stringify(seeded)); } catch { /* noop */ }
  return seeded;
}

export function saveSkillProgress(skills: SkillProgress[]): SkillProgress[] {
  try {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
  } catch { /* noop */ }
  return skills;
}

export function updateSkillXp(skillId: string, xpGain: number): { skills: SkillProgress[]; leveledUp: boolean } {
  const skills = getSkillProgress();
  let leveledUp = false;
  const updated = skills.map(s => {
    if (s.id !== skillId) return s;
    let newXp = s.xp + xpGain;
    let newLevel = s.level;
    while (newXp >= 100 && newLevel < 5) {
      newXp -= 100;
      newLevel += 1;
      leveledUp = true;
    }
    return { ...s, level: newLevel, xp: newXp, lastPracticed: Date.now() };
  });
  saveSkillProgress(updated);
  return { skills: updated, leveledUp };
}

/* ========================================
 * DEFAULT SEED DATA (packed content)
 * Populates ContentLibrary, Syllabi, and Courses
 * on first load so the app is never empty.
 * ======================================== */

export const DEFAULT_CONTENT_RESOURCES: ContentResource[] = [
  { id: 'res_cs_001', title: 'MDN Web Docs — HTML, CSS, JavaScript Reference', subject: 'Computer Science', type: 'link', url: 'https://developer.mozilla.org', description: 'Comprehensive web development documentation from Mozilla.', tags: ['html', 'css', 'javascript', 'web-dev'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_cs_002', title: 'freeCodeCamp — Learn to Code', subject: 'Computer Science', type: 'link', url: 'https://www.freecodecamp.org', description: 'Free coding curriculum with interactive projects and certifications.', tags: ['javascript', 'python', 'web-dev', 'certification'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_cs_003', title: 'React.dev — Official React Documentation', subject: 'Computer Science', type: 'link', url: 'https://react.dev', description: 'The official React documentation with tutorials and API reference.', tags: ['react', 'frontend', 'javascript'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_cs_004', title: 'CS50 — Harvard Introduction to Computer Science', subject: 'Computer Science', type: 'link', url: 'https://pll.harvard.edu/course/cs50-introduction-computer-science', description: 'Harvard University’s introductory computer science course.', tags: ['cs', 'algorithms', 'harvard'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_cs_005', title: 'W3Schools — Web Tutorials', subject: 'Computer Science', type: 'link', url: 'https://www.w3schools.com', description: 'Beginner-friendly tutorials for HTML, CSS, JavaScript, and more.', tags: ['html', 'css', 'javascript', 'tutorial'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_math_001', title: 'Khan Academy — Mathematics', subject: 'Mathematics', type: 'link', url: 'https://www.khanacademy.org/math', description: 'Free math lessons from arithmetic to calculus and beyond.', tags: ['math', 'algebra', 'calculus', 'video'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_math_002', title: '3Blue1Brown — Visual Mathematics', subject: 'Mathematics', type: 'video', url: 'https://www.youtube.com/c/3blue1brown', description: 'Animated visual explanations of mathematical concepts.', tags: ['calculus', 'linear-algebra', 'visual', 'youtube'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_math_003', title: 'PatrickJMT — Just Math Tutorials', subject: 'Mathematics', type: 'video', url: 'https://patrickjmt.com', description: 'Clear, concise math tutorials for calculus, algebra, and statistics.', tags: ['calculus', 'algebra', 'statistics', 'tutorial'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_phy_001', title: 'Khan Academy — Physics', subject: 'Physics', type: 'link', url: 'https://www.khanacademy.org/science/physics', description: 'Physics lessons covering motion, energy, waves, and more.', tags: ['physics', 'mechanics', 'video'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_phy_002', title: 'The Physics Classroom', subject: 'Physics', type: 'link', url: 'https://www.physicsclassroom.com', description: 'Interactive physics tutorials and concept builders.', tags: ['physics', 'tutorial', 'interactive'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_phy_003', title: 'HyperPhysics', subject: 'Physics', type: 'link', url: 'http://hyperphysics.phy-astr.gsu.edu', description: 'Concept maps and physics reference from Georgia State University.', tags: ['physics', 'reference', 'concept-map'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_chm_001', title: 'Khan Academy — Chemistry', subject: 'Chemistry', type: 'link', url: 'https://www.khanacademy.org/science/chemistry', description: 'Chemistry lessons from atomic structure to organic chemistry.', tags: ['chemistry', 'organic', 'video'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_chm_002', title: 'LibreTexts Chemistry', subject: 'Chemistry', type: 'link', url: 'https://chem.libretexts.org', description: 'Open-access chemistry textbooks and references.', tags: ['chemistry', 'textbook', 'reference'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_bio_001', title: 'Khan Academy — Biology', subject: 'Biology', type: 'link', url: 'https://www.khanacademy.org/science/biology', description: 'Biology lessons from cells to ecosystems.', tags: ['biology', 'cells', 'ecology', 'video'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_bio_002', title: 'Crash Course Biology', subject: 'Biology', type: 'video', url: 'https://www.youtube.com/c/crashcourse', description: 'Fast-paced, engaging biology video lessons.', tags: ['biology', 'video', 'youtube'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_eng_001', title: 'Purdue OWL — Writing Lab', subject: 'English', type: 'link', url: 'https://owl.purdue.edu', description: 'Writing, citation, and grammar resources from Purdue University.', tags: ['writing', 'citation', 'grammar', 'reference'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_eng_002', title: 'BBC Learning English', subject: 'English', type: 'link', url: 'https://www.bbc.co.uk/learningenglish', description: 'English lessons, vocabulary, and grammar for learners.', tags: ['english', 'vocabulary', 'grammar'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_gen_001', title: 'MIT OpenCourseWare', subject: 'Computer Science', type: 'link', url: 'https://ocw.mit.edu', description: 'Free MIT course materials across computer science and engineering.', tags: ['mit', 'courseware', 'cs', 'engineering'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_gen_002', title: 'Coursera — Online Courses', subject: 'Computer Science', type: 'link', url: 'https://www.coursera.org', description: 'Online courses from top universities and companies.', tags: ['coursera', 'online-learning', 'certification'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_gen_003', title: 'edX — Free Online Courses', subject: 'Mathematics', type: 'link', url: 'https://www.edx.org', description: 'University-level courses from Harvard, MIT, and more.', tags: ['edx', 'university', 'free-courses'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
  { id: 'res_gen_004', title: 'TED-Ed — Lessons Worth Sharing', subject: 'Biology', type: 'video', url: 'https://ed.ted.com', description: 'Animated educational lessons on diverse topics.', tags: ['ted-ed', 'animation', 'lessons'], createdBy: 'AcademiaIQ', createdByEmail: 'academia@unipulse.io', createdAt: Date.now() },
];

export const DEFAULT_SYLLABI: Syllabus[] = [
  {
    id: 'syll_cs101',
    course: 'CS101',
    title: 'Introduction to Programming',
    subject: 'Computer Science',
    instructor: 'Dr. Ada Lovelace',
    instructorEmail: 'ada@unipulse.io',
    objectives: [
      'Understand fundamental programming concepts using JavaScript/TypeScript.',
      'Build interactive web pages with HTML, CSS, and React.',
      'Apply version control with Git and GitHub.',
      'Debug and test code using modern tooling.',
      'Develop problem-solving and algorithmic thinking skills.',
    ],
    modules: [
      { id: 'mod_cs101_1', title: 'Module 1 — Programming Basics', topics: ['Variables', 'Data Types', 'Operators', 'Control Flow'], resources: ['res_cs_001', 'res_cs_005'] },
      { id: 'mod_cs101_2', title: 'Module 2 — Functions & Scope', topics: ['Function Declarations', 'Arrow Functions', 'Closures', 'Scope'], resources: ['res_cs_001'] },
      { id: 'mod_cs101_3', title: 'Module 3 — Data Structures', topics: ['Arrays', 'Objects', 'Maps', 'Sets'], resources: ['res_cs_002'] },
      { id: 'mod_cs101_4', title: 'Module 4 — Introduction to React', topics: ['Components', 'Props', 'State', 'Event Handling'], resources: ['res_cs_003'] },
      { id: 'mod_cs101_5', title: 'Module 5 — Git & Version Control', topics: ['Git Basics', 'GitHub', 'Branching', 'Pull Requests'], resources: ['res_cs_004'] },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'syll_math101',
    course: 'MATH101',
    title: 'Calculus I',
    subject: 'Mathematics',
    instructor: 'Prof. Isaac Newton',
    instructorEmail: 'newton@unipulse.io',
    objectives: [
      'Compute limits and derivatives of functions.',
      'Apply differentiation to optimization problems.',
      'Understand definite and indefinite integrals.',
      'Model real-world phenomena with calculus.',
    ],
    modules: [
      { id: 'mod_math101_1', title: 'Module 1 — Limits & Continuity', topics: ['Limits', 'Continuity', 'Intermediate Value Theorem'], resources: ['res_math_001', 'res_math_002'] },
      { id: 'mod_math101_2', title: 'Module 2 — Derivatives', topics: ['Power Rule', 'Product Rule', 'Chain Rule', 'Implicit Differentiation'], resources: ['res_math_003'] },
      { id: 'mod_math101_3', title: 'Module 3 — Applications', topics: ['Related Rates', 'Optimization', 'Curve Sketching'], resources: ['res_math_001'] },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'syll_phy101',
    course: 'PHY101',
    title: 'General Physics I',
    subject: 'Physics',
    instructor: 'Dr. Marie Curie',
    instructorEmail: 'curie@unipulse.io',
    objectives: [
      'Understand classical mechanics and motion.',
      'Apply Newton’s laws to physical systems.',
      'Compute work, energy, and power.',
      'Study waves, sound, and thermodynamics.',
    ],
    modules: [
      { id: 'mod_phy101_1', title: 'Module 1 — Kinematics', topics: ['Displacement', 'Velocity', 'Acceleration', 'Projectile Motion'], resources: ['res_phy_001', 'res_phy_002'] },
      { id: 'mod_phy101_2', title: 'Module 2 — Dynamics', topics: ["Newton's Laws", 'Force', 'Friction', 'Circular Motion'], resources: ['res_phy_003'] },
      { id: 'mod_phy101_3', title: 'Module 3 — Energy', topics: ['Work', 'Kinetic Energy', 'Potential Energy', 'Conservation'], resources: ['res_phy_001'] },
    ],
    createdAt: Date.now(),
  },
];

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'course_cs101',
    code: 'CS101',
    title: 'Introduction to Programming',
    department: 'Computer Science',
    credits: 3,
    yearOfStudy: 1,
    level: 1,
    program: 'BSc Computer Science',
    bio: 'Foundational programming course covering web development, algorithms, and software engineering principles.',
    location: { campus: 'Main Campus', city: 'University City', country: 'Nigeria' },
    interests: ['web development', 'software engineering', 'algorithms'],
    subjects: ['Computer Science'],
    skills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Git', 'Problem Solving'],
    stats: { streak: 0, tasksCompleted: 0, studyHours: 0, gpa: undefined, achievements: 0 },
    joinDate: Date.now(),
  },
  {
    id: 'course_math101',
    code: 'MATH101',
    title: 'Calculus I',
    department: 'Mathematics',
    credits: 4,
    yearOfStudy: 1,
    level: 1,
    program: 'BSc Mathematics',
    bio: 'Introduction to differential and integral calculus with applications to science and engineering.',
    location: { campus: 'Science Campus', city: 'University City', country: 'Nigeria' },
    interests: ['calculus', 'mathematics', 'physics'],
    subjects: ['Mathematics'],
    skills: ['Limits', 'Derivatives', 'Integrals', 'Mathematical Modeling'],
    stats: { streak: 0, tasksCompleted: 0, studyHours: 0, gpa: undefined, achievements: 0 },
    joinDate: Date.now(),
  },
  {
    id: 'course_phy101',
    code: 'PHY101',
    title: 'General Physics I',
    department: 'Physics',
    credits: 4,
    yearOfStudy: 1,
    level: 1,
    program: 'BSc Physics',
    bio: 'Classical mechanics covering motion, forces, energy, and waves.',
    location: { campus: 'Science Campus', city: 'University City', country: 'Nigeria' },
    interests: ['mechanics', 'physics', 'energy'],
    subjects: ['Physics'],
    skills: ['Kinematics', 'Dynamics', 'Energy Conservation', 'Waves'],
    stats: { streak: 0, tasksCompleted: 0, studyHours: 0, gpa: undefined, achievements: 0 },
    joinDate: Date.now(),
  },
  {
    id: 'course_chm101',
    code: 'CHM101',
    title: 'General Chemistry I',
    department: 'Chemistry',
    credits: 3,
    yearOfStudy: 1,
    level: 1,
    program: 'BSc Chemistry',
    bio: 'Atomic structure, chemical bonding, stoichiometry, and introductory organic chemistry.',
    location: { campus: 'Science Campus', city: 'University City', country: 'Nigeria' },
    interests: ['chemistry', 'organic chemistry', 'laboratory'],
    subjects: ['Chemistry'],
    skills: ['Atomic Structure', 'Stoichiometry', 'Chemical Bonding', 'Lab Safety'],
    stats: { streak: 0, tasksCompleted: 0, studyHours: 0, gpa: undefined, achievements: 0 },
    joinDate: Date.now(),
  },
  {
    id: 'course_bio101',
    code: 'BIO101',
    title: 'General Biology I',
    department: 'Biology',
    credits: 3,
    yearOfStudy: 1,
    level: 1,
    program: 'BSc Biology',
    bio: 'Cell biology, genetics, evolution, and ecology fundamentals.',
    location: { campus: 'Science Campus', city: 'University City', country: 'Nigeria' },
    interests: ['biology', 'genetics', 'ecology'],
    subjects: ['Biology'],
    skills: ['Cell Biology', 'Genetics', 'Ecology', 'Laboratory Techniques'],
    stats: { streak: 0, tasksCompleted: 0, studyHours: 0, gpa: undefined, achievements: 0 },
    joinDate: Date.now(),
  },
  {
    id: 'course_eng101',
    code: 'ENG101',
    title: 'Academic Writing & Composition',
    department: 'English',
    credits: 3,
    yearOfStudy: 1,
    level: 1,
    program: 'BSc English',
    bio: 'Academic essay writing, research methods, and citation styles.',
    location: { campus: 'Main Campus', city: 'University City', country: 'Nigeria' },
    interests: ['writing', 'literature', 'research'],
    subjects: ['English'],
    skills: ['Essay Writing', 'APA Citation', 'Critical Analysis', 'Research'],
    stats: { streak: 0, tasksCompleted: 0, studyHours: 0, gpa: undefined, achievements: 0 },
    joinDate: Date.now(),
  },
];
