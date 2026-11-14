/*
 * AcademiaIQ — Permission System
 *
 * Role-based access control (RBAC) with granular resource actions.
 * Levels: view, edit, create, delete, manage
 * Roles: student, lecturer, admin, management
 */

export type PermissionLevel = 'view' | 'edit' | 'create' | 'delete' | 'manage' | 'none';
export type UserRole = 'student' | 'lecturer' | 'admin' | 'management';

export type Resource =
  | 'dashboard'
  | 'ai'
  | 'tasks'
  | 'study'
  | 'games'
  | 'achievements'
  | 'social'
  | 'students'
  | 'profile'
  | 'content'
  | 'syllabus'
  | 'studyplan'
  | 'lecturer'
  | 'admin'
  | 'rss'
  | 'settings';

interface RolePermissions {
  [role: string]: Record<Resource, PermissionLevel>;
}

const DEFAULT_PERMISSIONS: RolePermissions = {
  student: {
    dashboard: 'view',
    ai: 'edit',
    tasks: 'edit',
    study: 'view',
    games: 'view',
    achievements: 'view',
    social: 'edit',
    students: 'view',
    profile: 'edit',
    content: 'view',
    syllabus: 'view',
    studyplan: 'view',
    lecturer: 'none',
    admin: 'none',
    rss: 'view',
    settings: 'edit',
  },
  lecturer: {
    dashboard: 'edit',
    ai: 'edit',
    tasks: 'edit',
    study: 'view',
    games: 'view',
    achievements: 'view',
    social: 'edit',
    students: 'view',
    profile: 'edit',
    content: 'edit',
    syllabus: 'edit',
    studyplan: 'edit',
    lecturer: 'manage',
    admin: 'none',
    rss: 'edit',
    settings: 'edit',
  },
  admin: {
    dashboard: 'manage',
    ai: 'manage',
    tasks: 'manage',
    study: 'manage',
    games: 'manage',
    achievements: 'manage',
    social: 'manage',
    students: 'manage',
    profile: 'manage',
    content: 'manage',
    syllabus: 'manage',
    studyplan: 'manage',
    lecturer: 'manage',
    admin: 'manage',
    rss: 'manage',
    settings: 'manage',
  },
  management: {
    dashboard: 'manage',
    ai: 'manage',
    tasks: 'manage',
    study: 'manage',
    games: 'manage',
    achievements: 'manage',
    social: 'manage',
    students: 'manage',
    profile: 'manage',
    content: 'manage',
    syllabus: 'manage',
    studyplan: 'manage',
    lecturer: 'manage',
    admin: 'manage',
    rss: 'manage',
    settings: 'manage',
  },
};

export function hasPermission(role: UserRole | null | undefined, resource: Resource, level: PermissionLevel): boolean {
  if (!role) return false;
  if (level === 'none') return true;
  const perms = DEFAULT_PERMISSIONS[role];
  if (!perms) return false;
  const userLevel = perms[resource];
  if (!userLevel) return false;
  const levelRank: Record<PermissionLevel, number> = { view: 1, edit: 2, create: 3, delete: 4, manage: 5, none: 0 };
  const reqRank = levelRank[level];
  const userRank = levelRank[userLevel];
  return userRank >= reqRank;
}

export function canView(role: UserRole | null | undefined, resource: Resource): boolean {
  return hasPermission(role, resource, 'view');
}

export function canEdit(role: UserRole | null | undefined, resource: Resource): boolean {
  return hasPermission(role, resource, 'edit');
}

export function canCreate(role: UserRole | null | undefined, resource: Resource): boolean {
  return hasPermission(role, resource, 'create');
}

export function canDelete(role: UserRole | null | undefined, resource: Resource): boolean {
  return hasPermission(role, resource, 'delete');
}

export function canManage(role: UserRole | null | undefined, resource: Resource): boolean {
  return hasPermission(role, resource, 'manage');
}

export function isTeacherRole(role: UserRole | null | undefined): boolean {
  return role === 'lecturer' || role === 'admin' || role === 'management';
}

export function isStudentRole(role: UserRole | null | undefined): boolean {
  return role === 'student';
}

export const RESOURCE_LABELS: Record<Resource, string> = {
  dashboard: 'Dashboard',
  ai: 'AI Assistant',
  tasks: 'Tasks',
  study: 'Study Tracker',
  games: 'Games',
  achievements: 'Achievements',
  social: 'Friends & Rooms',
  students: 'Student Profiles',
  profile: 'Profile',
  content: 'Content Library',
  syllabus: 'Syllabus',
  studyplan: 'Study Plan',
  lecturer: 'Lecturer Portal',
  admin: 'Admin Panel',
  rss: 'Education RSS',
  settings: 'Settings',
};
