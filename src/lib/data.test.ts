import { describe, it, expect, beforeEach } from 'vitest';
import { getContentResources, getSyllabi, getAllCourses, loadData } from './storage';
import { EDU_RSS_FEEDS } from './edu-seeds';
import { api } from './api';

/**
 * Verifies the app ships with real, packed content out of the box
 * (not empty states) for Content Library, Syllabi, Courses and the
 * classmate directory used by Social / Find Fellow Students.
 */
describe('Seeded content integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ships with at least 15 content resources', () => {
    const resources = getContentResources();
    expect(resources.length).toBeGreaterThanOrEqual(15);
    expect(resources.every(r => r.title && r.subject && r.type)).toBe(true);
  });

  it('ships with at least 10 syllabus templates that have modules', () => {
    const syllabi = getSyllabi();
    expect(syllabi.length).toBeGreaterThanOrEqual(10);
    expect(syllabi.every(s => s.modules.length > 0 && s.objectives.length > 0)).toBe(true);
  });

  it('ships with at least 10 courses that have skills', () => {
    const courses = getAllCourses();
    expect(courses.length).toBeGreaterThanOrEqual(10);
    expect(courses.every(c => c.skills.length > 0)).toBe(true);
  });

  it('seeds a classmate directory after first login', async () => {
    await api.authLogin({ email: 'student@unipulse.io', password: 'student123' });
    const users = loadData<any[]>('users', []);
    expect(users.length).toBeGreaterThanOrEqual(12);
    const students = users.filter(u => u.role === 'student');
    expect(students.length).toBeGreaterThanOrEqual(10);
    // Students have the fields the Social / Find Fellow pages rely on
    expect(students.every(s => s.name && s.email && s.studentId)).toBe(true);
  });

  it('ships with at least 20 curated RSS feeds', () => {
    expect(EDU_RSS_FEEDS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(EDU_RSS_FEEDS.map(f => f.category)).size).toBeGreaterThanOrEqual(5);
  });
});
