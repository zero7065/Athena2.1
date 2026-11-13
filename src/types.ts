export type UserRole = 'student' | 'lecturer' | 'admin' | 'management';
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
  feedbackCount: number;
  gaveFiveStar: boolean;
  contactedSupport: boolean;
}

/** Management onboarding / approval request */
export interface ManagementRequest {
  id: string;
  email: string;
  requestedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: number;
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

/** Learning content resource (note, pdf, link, video, slides) */
export interface ContentResource {
  id: string;
  title: string;
  subject: string;
  type: 'note' | 'pdf' | 'link' | 'video' | 'slides';
  url?: string;
  description?: string;
  tags: string[];
  createdBy: string;
  createdByEmail: string;
  createdAt: number;
  tenantId?: string;
}

/** Course syllabus module */
export interface SyllabusModule {
  id: string;
  title: string;
  topics: string[];
  resources: string[]; // contentResource ids
}

/** Course syllabus */
export interface Syllabus {
  id: string;
  course: string;
  title: string;
  subject: string;
  instructor: string;
  instructorEmail: string;
  objectives: string[];
  modules: SyllabusModule[];
  createdAt: number;
}

/** Course / syllabus entry for the curriculum */
export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  yearOfStudy: number;
  level: number;
  program: string;
  bio?: string;
  location: { campus: string; city: string; country: string };
  interests: string[];
  subjects: string[];
  skills: string[];
  socialLinks?: Record<string, string>;
  preferences?: { darkMode: boolean; notifications: boolean; studyStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'; privacy: 'public' | 'friends' | 'private' };
  stats?: { streak: number; tasksCompleted: number; studyHours: number; gpa?: number; achievements: number };
  joinDate: number;
  isOnline?: boolean;
  lastSeen?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
