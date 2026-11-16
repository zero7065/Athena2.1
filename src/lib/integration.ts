/**
 * AcademiaIQ — School Information System (SIS) Integration Layer
 *
 * Provider-agnostic adapter designed to connect to a university/school
 * management system such as EduManager, or any SIS that can provide:
 *   1. A REST API (configurable base URL + auth header), and/or
 *   2. CSV exports (students, courses, enrollments, results).
 *
 * Nothing here assumes a specific vendor. You configure it in
 * Admin → Integrations. That keeps us partnership-ready: whatever access
 * EduManager grants (API key, SFTP dump, portal CSV export) maps onto this.
 */

import { loadData, saveData, LocalTask } from './storage';

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

export interface SisConfig {
  provider: string;          // e.g. "EduManager"
  baseUrl: string;           // e.g. https://api.edumanager.ng/v1
  apiKey: string;            // bearer token / API key
  authHeader: string;        // header name, default Authorization
  authPrefix: string;        // e.g. "Bearer "
  healthPath: string;        // e.g. /health or /ping
  studentsPath: string;      // e.g. /students
  coursesPath: string;       // e.g. /courses
  enabled: boolean;
}

const CONFIG_KEY = 'sis_config';
const LAST_SYNC_KEY = 'sis_last_sync';

export const DEFAULT_SIS_CONFIG: SisConfig = {
  provider: 'EduManager',
  baseUrl: '',
  apiKey: '',
  authHeader: 'Authorization',
  authPrefix: 'Bearer ',
  healthPath: '/health',
  studentsPath: '/students',
  coursesPath: '/courses',
  enabled: false,
};

export function getSisConfig(): SisConfig {
  return { ...DEFAULT_SIS_CONFIG, ...loadData<Partial<SisConfig>>(CONFIG_KEY, {}) };
}

export function saveSisConfig(config: SisConfig): SisConfig {
  saveData(CONFIG_KEY, config);
  return config;
}

export function getLastSync(): number | null {
  return loadData<number | null>(LAST_SYNC_KEY, null);
}

function markSynced() {
  saveData(LAST_SYNC_KEY, Date.now());
}

/* ------------------------------------------------------------------ */
/* CSV parsing (RFC-4180-ish: handles quotes, commas, CRLF)            */
/* ------------------------------------------------------------------ */

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n') {
      row.push(field); field = '';
      if (row.some(c => c.trim() !== '')) rows.push(row);
      row = [];
    } else if (ch === '\r') {
      /* ignore, handled by \n */
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some(c => c.trim() !== '')) rows.push(row);
  return rows;
}

/** Convert rows to objects using the first row as headers (normalised). */
export function csvToObjects(text: string): Array<Record<string, string>> {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.slice(1).map(r => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (r[i] ?? '').trim(); });
    return obj;
  });
}

/* ------------------------------------------------------------------ */
/* CSV importers — map common column names onto our local shapes       */
/* ------------------------------------------------------------------ */

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return row[k];
  }
  return '';
}

export interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
  warnings: string[];
}

/** Import students into the local user directory (used by Social, Find Fellow, Admin). */
export function importStudentsCsv(text: string): ImportResult {
  const rows = csvToObjects(text);
  const warnings: string[] = [];
  let imported = 0;
  let skipped = 0;

  let users: any[] = loadData<any[]>('users', []);
  if (!Array.isArray(users)) users = [];

  for (const row of rows) {
    const name = pick(row, ['name', 'full_name', 'student_name', 'student']);
    const email = pick(row, ['email', 'student_email', 'e_mail']);
    const studentId = pick(row, ['student_id', 'matric_no', 'matriculation_number', 'admission_no', 'reg_no', 'id']);
    const department = pick(row, ['department', 'program', 'programme', 'course', 'faculty', 'class']);
    const level = pick(row, ['level', 'year', 'year_of_study', 'class_level']);

    if (!name || (!email && !studentId)) {
      skipped++;
      if (warnings.length < 5) warnings.push(`Skipped a row without name and email/ID.`);
      continue;
    }

    const resolvedEmail = email || `${(studentId || name).toLowerCase().replace(/[^a-z0-9]+/g, '.')}@imported.local`;
    const existing = users.find(u => (u.email && u.email.toLowerCase() === resolvedEmail.toLowerCase()) || (studentId && u.studentId === studentId));
    if (existing) {
      // Update in place
      existing.name = name;
      existing.department = department || existing.department;
      existing.studentId = studentId || existing.studentId;
      if (level) existing.level = parseInt(level, 10) || existing.level;
      skipped++;
      continue;
    }

    users.push({
      name,
      email: resolvedEmail,
      studentId: studentId || `IMP${Date.now().toString(36).toUpperCase().slice(-5)}${imported}`,
      department: department || 'General',
      role: 'student',
      level: parseInt(level, 10) || 1,
    });
    imported++;
  }

  saveData('users', users);
  markSynced();
  return { imported, skipped, total: rows.length, warnings };
}

/** Import courses into the local course catalogue. */
export function importCoursesCsv(text: string): ImportResult {
  const rows = csvToObjects(text);
  const courses = loadData<any[]>('courses', []);
  const list = Array.isArray(courses) ? courses : [];
  let imported = 0;
  let skipped = 0;
  const warnings: string[] = [];

  for (const row of rows) {
    const code = pick(row, ['code', 'course_code', 'course', 'subject_code']);
    const title = pick(row, ['title', 'course_title', 'name', 'subject']);
    if (!code || !title) {
      skipped++;
      if (warnings.length < 5) warnings.push('Skipped a course row without code and title.');
      continue;
    }
    const existing = list.find((c: any) => c.code === code);
    if (existing) { existing.title = title; skipped++; continue; }

    list.push({
      id: `course_${code}_${Date.now().toString(36)}`,
      code,
      title,
      department: pick(row, ['department', 'faculty']) || 'General',
      credits: parseInt(pick(row, ['credits', 'units', 'credit_units']), 10) || 3,
      yearOfStudy: parseInt(pick(row, ['year', 'year_of_study']), 10) || 1,
      level: parseInt(pick(row, ['level']), 10) || 1,
      program: pick(row, ['program', 'programme']) || '',
      interests: [],
      subjects: [pick(row, ['subject', 'department']) || 'General'],
      skills: pick(row, ['skills']).split(/[;|]/).map(s => s.trim()).filter(Boolean),
      location: { campus: 'Main Campus', city: '', country: '' },
      joinDate: Date.now(),
    });
    imported++;
  }

  saveData('courses', list);
  markSynced();
  return { imported, skipped, total: rows.length, warnings };
}

/** Import results/grades as lecturer-visible submissions rows. */
export function importResultsCsv(text: string): ImportResult {
  const rows = csvToObjects(text);
  const submissions = loadData<any[]>('submissions', []);
  const list = Array.isArray(submissions) ? submissions : [];
  let imported = 0;
  let skipped = 0;
  const warnings: string[] = [];

  for (const row of rows) {
    const studentName = pick(row, ['student_name', 'name', 'student']);
    const studentId = pick(row, ['student_id', 'matric_no', 'reg_no']);
    const assignment = pick(row, ['course', 'subject', 'course_code', 'assignment']);
    const scoreRaw = pick(row, ['score', 'total', 'marks', 'grade_point', 'result']);
    if (!studentName || !assignment || !scoreRaw) {
      skipped++;
      if (warnings.length < 5) warnings.push('Skipped a result row missing student, course, or score.');
      continue;
    }
    const score = Math.max(0, Math.min(100, Math.round(parseFloat(scoreRaw) || 0)));
    list.push({
      id: `imp_${Date.now().toString(36)}_${imported}`,
      studentId: studentId || '',
      studentName,
      studentEmail: pick(row, ['email', 'student_email']) || '',
      studentDepartment: pick(row, ['department', 'class']) || '',
      assignmentTitle: assignment,
      description: 'Imported from SIS',
      status: 'graded',
      score,
      feedback: 'Synced from school management system',
      submittedAt: Date.now(),
      gradedAt: Date.now(),
    });
    imported++;
  }

  saveData('submissions', list);
  markSynced();
  return { imported, skipped, total: rows.length, warnings };
}

/** Convert imported student rows into assigned tasks (term checklist). */
export function importTasksCsv(text: string, assignedTo?: string): ImportResult & { tasks: LocalTask[] } {
  const rows = csvToObjects(text);
  const tasks: LocalTask[] = [];
  rows.forEach((row, i) => {
    const title = pick(row, ['title', 'task', 'assignment', 'description']);
    if (!title) return;
    tasks.push({
      id: `imp_task_${Date.now().toString(36)}_${i}`,
      title,
      description: pick(row, ['description', 'notes', 'details']),
      dueDate: pick(row, ['due_date', 'deadline', 'date']) || new Date().toISOString().split('T')[0],
      priority: (pick(row, ['priority']) as LocalTask['priority']) || 'medium',
      status: 'todo',
      createdAt: Date.now(),
      assignedTo,
    });
  });
  return { imported: tasks.length, skipped: rows.length - tasks.length, total: rows.length, warnings: [], tasks };
}

/* ------------------------------------------------------------------ */
/* REST adapter                                                       */
/* ------------------------------------------------------------------ */

function buildHeaders(config: SisConfig): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (config.apiKey) headers[config.authHeader || 'Authorization'] = `${config.authPrefix || ''}${config.apiKey}`;
  return headers;
}

function joinUrl(base: string, path: string): string {
  if (!base) throw new Error('Base URL is not configured.');
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export interface ConnectionResult {
  ok: boolean;
  status?: number;
  message: string;
  latencyMs?: number;
}

/** Test the configured SIS API. Never throws — returns a status object. */
export async function testSisConnection(config: SisConfig = getSisConfig()): Promise<ConnectionResult> {
  if (!config.baseUrl) return { ok: false, message: 'Add the API base URL first.' };
  const started = Date.now();
  try {
    const res = await fetch(joinUrl(config.baseUrl, config.healthPath || '/'), {
      method: 'GET',
      headers: buildHeaders(config),
    });
    const latencyMs = Date.now() - started;
    if (res.ok) return { ok: true, status: res.status, message: `Connected (${res.status})`, latencyMs };
    // Some APIs return 401/403 on /health but are reachable
    if (res.status === 401 || res.status === 403) {
      return { ok: false, status: res.status, message: `Reachable but unauthorized (${res.status}). Check the API key.`, latencyMs };
    }
    if (res.status === 404) {
      return { ok: false, status: res.status, message: 'Reachable, but the health path was not found (404). Adjust it.', latencyMs };
    }
    return { ok: false, status: res.status, message: `Unexpected response (${res.status}).`, latencyMs };
  } catch (e: any) {
    return { ok: false, message: `Cannot reach the API: ${e?.message || 'network error'}. Check URL/CORS.`, latencyMs: Date.now() - started };
  }
}

export interface PullResult {
  ok: boolean;
  message: string;
  count: number;
  students?: Array<Record<string, string>>;
}

/** Pull students from the configured SIS REST endpoint. */
export async function pullStudents(config: SisConfig = getSisConfig()): Promise<PullResult> {
  if (!config.baseUrl) return { ok: false, message: 'Base URL not configured.', count: 0 };
  try {
    const res = await fetch(joinUrl(config.baseUrl, config.studentsPath || '/students'), {
      headers: buildHeaders(config),
    });
    if (!res.ok) return { ok: false, message: `SIS returned ${res.status}.`, count: 0 };
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (data.data || data.students || []);
    if (!Array.isArray(arr) || arr.length === 0) {
      return { ok: false, message: 'Connected, but no student records were returned. Check the students path.', count: 0 };
    }
    // Normalise + persist into the local directory
    const users = loadData<any[]>('users', []);
    const list = Array.isArray(users) ? users : [];
    let added = 0;
    for (const s of arr) {
      const name = s.name || s.full_name || s.student_name || `${s.first_name || ''} ${s.last_name || ''}`.trim();
      const email = s.email || s.student_email;
      const studentId = s.student_id || s.matric_no || s.admission_no || s.id;
      if (!name) continue;
      if (list.some(u => (email && u.email === email) || (studentId && u.studentId === String(studentId)))) continue;
      list.push({
        name,
        email: email || `${String(studentId || name).toLowerCase().replace(/[^a-z0-9]+/g, '.')}@imported.local`,
        studentId: studentId ? String(studentId) : `SIS${Date.now().toString(36).toUpperCase().slice(-5)}`,
        department: s.department || s.program || s.class || 'General',
        role: 'student',
        level: parseInt(String(s.level || s.year || 1), 10) || 1,
      });
      added++;
    }
    saveData('users', list);
    markSynced();
    return { ok: true, message: `Pulled ${arr.length} records, added ${added} new students.`, count: added };
  } catch (e: any) {
    return { ok: false, message: `Pull failed: ${e?.message || 'network error'}.`, count: 0 };
  }
}

/* ------------------------------------------------------------------ */
/* Readiness report — what's needed for a real partnership             */
/* ------------------------------------------------------------------ */

export interface ReadinessItem {
  label: string;
  ok: boolean;
  detail: string;
}

export function integrationReadiness(): ReadinessItem[] {
  const config = getSisConfig();
  const lastSync = getLastSync();
  return [
    { label: 'Provider set', ok: Boolean(config.provider), detail: config.provider || 'Not configured' },
    { label: 'REST API base URL', ok: Boolean(config.baseUrl), detail: config.baseUrl || 'Not provided by SIS yet' },
    { label: 'API credentials', ok: Boolean(config.apiKey), detail: config.apiKey ? 'Stored locally' : 'Awaiting API key from SIS' },
    { label: 'CSV import path available', ok: true, detail: 'Works with any portal export' },
    { label: 'Last successful sync', ok: Boolean(lastSync), detail: lastSync ? new Date(lastSync).toLocaleString() : 'Never' },
  ];
}
