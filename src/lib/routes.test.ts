import { describe, it, expect } from 'vitest';
import {
  NAV_GROUPS, ROUTE_IDS, MOBILE_PRIMARY, navGroupsForRole,
  findNavItem, findGroupOf, tabToPath, tabFromHash, canAccess,
} from './routes';

describe('Navigation registry', () => {
  it('exposes every expected route', () => {
    const expected = [
      'dashboard', 'ai', 'tasks', 'study', 'content', 'syllabus', 'studyplan',
      'courses', 'skills', 'rss', 'social', 'find-fellow', 'students',
      'achievements', 'games', 'cbt', 'profile', 'lecturer', 'admin',
    ];
    for (const id of expected) expect(ROUTE_IDS).toContain(id);
  });

  it('groups are titled and non-empty', () => {
    for (const g of NAV_GROUPS) {
      expect(g.title.length).toBeGreaterThan(0);
      expect(g.items.length).toBeGreaterThan(0);
    }
  });

  it('primary mobile routes all exist', () => {
    for (const id of MOBILE_PRIMARY) expect(ROUTE_IDS).toContain(id);
  });

  it('admin-only routes are hidden from students', () => {
    const student = navGroupsForRole('student').flatMap(g => g.items.map(i => i.id));
    expect(student).not.toContain('admin');
    expect(student).not.toContain('lecturer');
    expect(student).toContain('dashboard');
  });

  it('admin sees the admin panel and lecturer sees the lecturer portal', () => {
    const admin = navGroupsForRole('admin').flatMap(g => g.items.map(i => i.id));
    const lecturer = navGroupsForRole('lecturer').flatMap(g => g.items.map(i => i.id));
    expect(admin).toContain('admin');
    expect(admin).toContain('lecturer');
    expect(lecturer).toContain('lecturer');
    expect(lecturer).not.toContain('admin');
  });

  it('finds items and their parent group', () => {
    expect(findNavItem('tasks')?.label).toBe('Tasks');
    expect(findGroupOf('tasks')).toBe('Academic');
    expect(findGroupOf('social')).toBe('Community');
    expect(findGroupOf('admin')).toBe('Management');
  });

  it('round-trips tabs to hash paths', () => {
    expect(tabToPath('tasks')).toBe('#/tasks');
    expect(tabFromHash('#/tasks')).toBe('tasks');
    expect(tabFromHash('#/tasks?x=1')).toBe('tasks');
    expect(tabFromHash('#/does-not-exist')).toBeNull();
    expect(tabFromHash('')).toBeNull();
  });

  it('guards role access', () => {
    const adminItem = findNavItem('admin')!;
    expect(canAccess(adminItem, 'student')).toBe(false);
    expect(canAccess(adminItem, 'admin')).toBe(true);
    expect(canAccess(findNavItem('dashboard')!, 'student')).toBe(true);
  });
});
