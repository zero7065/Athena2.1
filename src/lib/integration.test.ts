import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseCsv, csvToObjects, importStudentsCsv, importCoursesCsv,
  importResultsCsv, getSisConfig, saveSisConfig, testSisConnection,
  integrationReadiness, getLastSync,
} from './integration';
import { loadData } from './storage';

describe('SIS CSV parsing', () => {
  it('parses simple rows', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('handles quoted fields with commas and escaped quotes', () => {
    const rows = parseCsv('name,note\n"Doe, Jane","She said ""hi"""');
    expect(rows[1][0]).toBe('Doe, Jane');
    expect(rows[1][1]).toBe('She said "hi"');
  });

  it('normalises headers to snake_case objects', () => {
    const objs = csvToObjects('Student Name,Student ID\nAmina,STU101');
    expect(objs[0]).toEqual({ student_name: 'Amina', student_id: 'STU101' });
  });

  it('ignores blank trailing lines', () => {
    expect(csvToObjects('a,b\n1,2\n\n')).toHaveLength(1);
  });
});

describe('SIS CSV importers', () => {
  beforeEach(() => localStorage.clear());

  it('imports students into the local directory with flexible columns', () => {
    const csv = [
      'Full Name,Email,Matric No,Department,Level',
      'Amina Bello,amina@uni.edu,MAT101,Computer Science,3',
      'David Adewale,,MAT102,Mathematics,2',
    ].join('\n');
    const res = importStudentsCsv(csv);
    expect(res.imported).toBe(2);
    const users = loadData<any[]>('users', []);
    expect(users).toHaveLength(2);
    expect(users[0].name).toBe('Amina Bello');
    expect(users[0].studentId).toBe('MAT101');
    expect(users[1].email).toContain('@imported.local');
    expect(getLastSync()).not.toBeNull();
  });

  it('skips duplicate students instead of duplicating them', () => {
    const csv = 'name,email,student_id\nAmina,a@u.io,S1\nAmina,a@u.io,S1';
    const res = importStudentsCsv(csv);
    expect(res.imported).toBe(1);
    expect(res.skipped).toBe(1);
    expect(loadData<any[]>('users', [])).toHaveLength(1);
  });

  it('imports courses with credits and skills', () => {
    const csv = 'code,title,department,credits,skills\nCS101,Intro to Programming,CS,3,JavaScript;React';
    const res = importCoursesCsv(csv);
    expect(res.imported).toBe(1);
    const courses = loadData<any[]>('courses', []);
    expect(courses[0].code).toBe('CS101');
    expect(courses[0].skills).toEqual(['JavaScript', 'React']);
  });

  it('imports graded results clamped to 0-100', () => {
    const csv = 'student_name,student_id,course,score\nAmina,S1,CS101,85\nDavid,S2,CS101,140';
    const res = importResultsCsv(csv);
    expect(res.imported).toBe(2);
    const subs = loadData<any[]>('submissions', []);
    expect(subs[0].score).toBe(85);
    expect(subs[1].score).toBe(100);
    expect(subs.every(s => s.status === 'graded')).toBe(true);
  });

  it('reports warnings for unusable rows', () => {
    const res = importStudentsCsv('name,email\n,\nReal Name,real@uni.edu');
    expect(res.imported).toBe(1);
    expect(res.total).toBe(1); // blank row is dropped, only real row counted
  });
});

describe('SIS REST readiness + connection', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reports readiness items and reflects saved config', () => {
    const before = integrationReadiness();
    expect(before.find(i => i.label === 'REST API base URL')?.ok).toBe(false);

    saveSisConfig({ ...getSisConfig(), provider: 'EduManager', baseUrl: 'https://api.example.com/v1', apiKey: 'k' });
    const after = integrationReadiness();
    expect(after.find(i => i.label === 'REST API base URL')?.ok).toBe(true);
    expect(after.find(i => i.label === 'API credentials')?.ok).toBe(true);
  });

  it('returns a friendly failure when no base URL is set', async () => {
    const r = await testSisConnection({ ...getSisConfig(), baseUrl: '' });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/base url/i);
  });

  it('reports 401 as reachable-but-unauthorized', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const r = await testSisConnection({ ...getSisConfig(), baseUrl: 'https://api.example.com', healthPath: '/health' });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/unauthorized/i);
  });

  it('reports success on 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const r = await testSisConnection({ ...getSisConfig(), baseUrl: 'https://api.example.com', healthPath: '/health' });
    expect(r.ok).toBe(true);
    expect(r.status).toBe(200);
  });
});
