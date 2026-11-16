/**
 * AcademiaIQ API Client
 *
 * Two modes:
 *  1. Remote mode  – set VITE_API_BASE (e.g. https://api.example.com/api) to use
 *     the Express backend in /backend.
 *  2. Local mode   – no VITE_API_BASE configured (default on Vercel/Render static
 *     deploys). Auth is handled entirely in localStorage with seeded demo
 *     accounts so sign-in / sign-up / demo logins always work with no server.
 *
 * If a remote backend is configured but unreachable, auth transparently falls
 * back to local mode instead of throwing a network error.
 */

const REMOTE_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '');
const API_BASE = REMOTE_BASE || '/api';
const USE_REMOTE = Boolean(REMOTE_BASE);

/* ------------------------------------------------------------------ */
/* Local auth store                                                    */
/* ------------------------------------------------------------------ */

interface LocalUser {
  email: string;
  password: string;
  name: string;
  studentId: string;
  department: string;
  role: 'student' | 'lecturer' | 'admin' | 'management';
  level?: number;
  interests?: string[];
  subjects?: string[];
  location?: { campus: string; city: string; country: string };
}

const USERS_KEY = 'unipulse_users';

const DEMO_USERS: LocalUser[] = [
  { name: 'Student Demo', email: 'student@unipulse.io', password: 'student123', studentId: 'STU001', department: 'Computer Science', role: 'student', level: 3, interests: ['AI', 'Web Development', 'Hackathons'], subjects: ['CS101', 'CS202', 'MATH201'], location: { campus: 'Main Campus', city: 'Bokkos', country: 'Nigeria' } },
  { name: 'Lecturer Demo', email: 'lecturer@unipulse.io', password: 'lecturer123', studentId: 'LEC001', department: 'Computer Science', role: 'lecturer' },
  { name: 'Admin Demo', email: 'admin@unipulse.io', password: 'admin123', studentId: 'ADM001', department: 'Administration', role: 'admin' },
  // Demo classmates so Social / Find Fellow Students / Student Profiles are populated
  { name: 'Amina Bello', email: 'amina.bello@unipulse.io', password: 'student123', studentId: 'STU101', department: 'Computer Science', role: 'student', level: 4, interests: ['Python', 'Machine Learning', 'Data Science', 'Open Source'], subjects: ['CS101', 'CS202', 'CS305', 'MATH201'], location: { campus: 'Main Campus', city: 'Bokkos', country: 'Nigeria' } },
  { name: 'David Adewale', email: 'david.adewale@unipulse.io', password: 'student123', studentId: 'STU102', department: 'Mathematics', role: 'student', level: 2, interests: ['Calculus', 'Statistics', 'Puzzles'], subjects: ['MATH101', 'MATH201', 'PHY101'], location: { campus: 'Science Campus', city: 'Bokkos', country: 'Nigeria' } },
  { name: 'Grace Okonkwo', email: 'grace.okonkwo@unipulse.io', password: 'student123', studentId: 'STU103', department: 'Biology', role: 'student', level: 4, interests: ['Genetics', 'Ecology', 'Medical Research'], subjects: ['BIO101', 'BIO202', 'CHM101'], location: { campus: 'Medical Campus', city: 'Bokkos', country: 'Nigeria' } },
  { name: 'Samuel Obi', email: 'samuel.obi@unipulse.io', password: 'student123', studentId: 'STU104', department: 'Physics', role: 'student', level: 3, interests: ['Quantum Mechanics', 'Programming', 'Research'], subjects: ['PHY101', 'PHY202', 'MATH301'], location: { campus: 'Science Campus', city: 'Bokkos', country: 'Nigeria' } },
  { name: 'Fatima Aliyu', email: 'fatima.aliyu@unipulse.io', password: 'student123', studentId: 'STU105', department: 'English', role: 'student', level: 1, interests: ['Literature', 'Poetry', 'Writing'], subjects: ['ENG101', 'LIT202'], location: { campus: 'Arts Campus', city: 'Bokkos', country: 'Nigeria' } },
  { name: 'Chukwuma Okoro', email: 'chukwuma.okoro@unipulse.io', password: 'student123', studentId: 'STU106', department: 'Chemistry', role: 'student', level: 3, interests: ['Organic Chemistry', 'Lab Work', 'Research'], subjects: ['CHM101', 'CHM202', 'BIO101'], location: { campus: 'Science Campus', city: 'Bokkos', country: 'Nigeria' } },
];

function readUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as LocalUser[]) : [];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
      return [...DEMO_USERS];
    }
    // Ensure demo accounts always exist (users may have signed up before)
    let changed = false;
    for (const demo of DEMO_USERS) {
      if (!parsed.some((u) => u.email.toLowerCase() === demo.email.toLowerCase())) {
        parsed.push(demo);
        changed = true;
      }
    }
    if (changed) localStorage.setItem(USERS_KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS)); } catch { /* ignore */ }
    return [...DEMO_USERS];
  }
}

function writeUsers(users: LocalUser[]) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch { /* ignore */ }
}

function makeLocalToken(email: string): string {
  const payload = JSON.stringify({ email, iat: Date.now() });
  try {
    return `local.${btoa(payload)}`;
  } catch {
    return `local.${Date.now()}`;
  }
}

function toAuthUser(u: LocalUser) {
  return {
    id: u.studentId || u.email,
    email: u.email,
    name: u.name,
    role: u.role,
    department: u.department,
    student_id: u.studentId,
    studentId: u.studentId,
  };
}

function localLogin(email: string, password: string) {
  const users = readUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (!user) {
    const emailExists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    throw new Error(emailExists ? 'Incorrect password. Try the demo password shown on the card.' : 'No account found for this email. Create one or use a demo account.');
  }
  return { token: makeLocalToken(user.email), user: toAuthUser(user) };
}

function localRegister(data: { email: string; password: string; name: string; role?: string; department?: string; student_id?: string }) {
  const users = readUsers();
  const email = data.email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error('Email already registered');
  }
  const newUser: LocalUser = {
    email: data.email.trim(),
    password: data.password,
    name: data.name.trim(),
    studentId: data.student_id || `STU${Date.now().toString(36).toUpperCase().slice(-6)}`,
    department: data.department || 'General',
    role: (data.role as LocalUser['role']) || 'student',
  };
  users.push(newUser);
  writeUsers(users);
  return { token: makeLocalToken(newUser.email), user: toAuthUser(newUser) };
}

/* ------------------------------------------------------------------ */
/* HTTP helper                                                         */
/* ------------------------------------------------------------------ */

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => { headers[key] = value; });
    } else {
      Object.assign(headers, options.headers);
    }
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Auth with local fallback                                            */
/* ------------------------------------------------------------------ */

async function authLogin(data: { email: string; password: string }) {
  if (!USE_REMOTE) return localLogin(data.email, data.password);
  try {
    return await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  } catch (err) {
    // Only fall back for network/transport failures, not bad credentials.
    if (err instanceof TypeError) return localLogin(data.email, data.password);
    throw err;
  }
}

async function authRegister(data: { email: string; password: string; name: string; role?: string; department?: string; student_id?: string }) {
  if (!USE_REMOTE) return localRegister(data);
  try {
    return await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  } catch (err) {
    if (err instanceof TypeError) return localRegister(data);
    throw err;
  }
}

export const api = {
  // Auth (always available, even with no backend)
  authLogin,
  authRegister,
  authProfile: () => apiRequest('/auth/profile', { method: 'GET' }),
  authUpdateProfile: (data: any) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Tasks
  tasksList: (params?: { status?: string; priority?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiRequest(`/tasks${qs ? '?' + qs : ''}`, { method: 'GET' });
  },
  tasksCreate: (data: any) => apiRequest('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  tasksUpdate: (id: string, data: any) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  tasksDelete: (id: string) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
  tasksStats: () => apiRequest('/tasks/stats', { method: 'GET' }),

  // Skills
  skillsList: () => apiRequest('/skills', { method: 'GET' }),
  skillsUpdateXP: (id: string, xpGain: number) => apiRequest(`/skills/${id}/xp`, { method: 'POST', body: JSON.stringify({ xp_gain: xpGain }) }),
  skillsSeed: () => apiRequest('/skills/seed', { method: 'POST' }),

  // Submissions
  submissionsStudent: () => apiRequest('/submissions/student', { method: 'GET' }),
  submissionsLecturer: () => apiRequest('/submissions/lecturer', { method: 'GET' }),
  submissionsCreate: (data: any) => apiRequest('/submissions', { method: 'POST', body: JSON.stringify(data) }),
  submissionsGrade: (id: string, data: { score: number; feedback?: string }) => apiRequest(`/submissions/${id}/grade`, { method: 'POST', body: JSON.stringify(data) }),
  submissionsStats: () => apiRequest('/submissions/stats', { method: 'GET' }),

  // Courses
  coursesList: () => apiRequest('/courses', { method: 'GET' }),
  coursesCreate: (data: any) => apiRequest('/courses', { method: 'POST', body: JSON.stringify(data) }),

  // RSS
  rssFetch: (url?: string) => apiRequest(`/rss${url ? '?url=' + encodeURIComponent(url) : ''}`, { method: 'GET' }),
};

export default api;
export { API_BASE, USE_REMOTE };
