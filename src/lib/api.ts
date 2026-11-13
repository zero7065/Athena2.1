import type { Course } from '../types';
import { StudentEnrollment } from './storage';
import { getAllCourses, saveCourses, addCourse, deleteCourse } from './storage';

/* ===== Local storage-backed course API (works offline, persists) ===== */

export const courseApi = {
  getAll: getAllCourses,
  saveAll: saveCourses,
  add: addCourse,
  delete: deleteCourse,
};

/* ===== Student enrollment API ===== */

export const enrollmentApi = {
  getForStudent: (email: string) => {
    const raw = localStorage.getItem('unipulse_enrollments');
    if (!raw) return [];
    return JSON.parse(raw) as StudentEnrollment[];
  },
  saveAll: (enrollments: StudentEnrollment[]) => {
    try { localStorage.setItem('unipulse_enrollments', JSON.stringify(enrollments)); return true; } catch { return false; }
  },
  enroll: (courseId: string, email: string) => {
    const all = enrollmentApi.getForStudent(email);
    if (all.some(e => e.courseId === courseId)) return false;
    return enrollmentApi.saveAll([...all, { courseId, studentEmail: email, enrolledAt: Date.now() }]);
  },
  unenroll: (courseId: string, email: string) => {
    const all = enrollmentApi.getForStudent(email).filter(e => e.courseId !== courseId);
    return enrollmentApi.saveAll(all);
  },
};

/* ===== External university data fetch hooks ===== */

export interface ExternalCourse {
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
}

/**
 * Fetch curriculum data from an external university API endpoint.
 * Falls back to an empty array on failure so the app stays usable offline.
 */
export async function fetchExternalCurriculum(
  endpoint: string,
  token?: string
): Promise<ExternalCourse[]> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.courses || []);
  } catch {
    return [];
  }
}

/**
 * Convert an external course record into the internal Course shape.
 */
export function toInternalCourse(ext: ExternalCourse, id?: string): Course {
  return {
    id: id || `course_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    code: ext.code,
    title: ext.title,
    department: ext.department,
    credits: ext.credits,
    yearOfStudy: ext.yearOfStudy,
    level: ext.level,
    program: ext.program,
    bio: ext.bio,
    location: ext.location,
    interests: ext.interests,
    subjects: ext.subjects,
    skills: ext.skills,
    joinDate: Date.now(),
  };
}

/**
 * Pull curriculum from an external university DB and merge into local storage.
 * Returns the merged course list.
 */
export async function syncCurriculumFromExternal(
  endpoint: string,
  token?: string
): Promise<{ courses: Course[]; added: number }> {
  const external = await fetchExternalCurriculum(endpoint, token);
  const existing = getAllCourses();
  const existingCodes = new Set(existing.map(c => c.code));
  let added = 0;
  for (const ext of external) {
    if (existingCodes.has(ext.code)) continue;
    addCourse(toInternalCourse(ext));
    added++;
  }
  return { courses: getAllCourses(), added };
}
