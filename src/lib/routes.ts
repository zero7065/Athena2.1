/**
 * AcademiaIQ — Navigation & Route Registry
 *
 * SINGLE SOURCE OF TRUTH for every destination in the app.
 * Used by the top navbar, the sidebar, the mobile bottom bar and the router.
 * Add a route here once and it appears everywhere.
 */

import {
  LayoutDashboard, Sparkles, CheckSquare, Timer, BookOpen, GraduationCap,
  Rss, Target, Users, MapPin, Users2, Trophy, Gamepad2, UserCircle,
  ShieldCheck, ClipboardList, type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Roles allowed to see this item. Undefined = everyone. */
  roles?: UserRole[];
  /** Short helper text used in menus/tooltips. */
  hint?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: 'Your academic overview' },
    ],
  },
  {
    title: 'Academic',
    items: [
      { id: 'ai', label: 'AI Assistant', icon: Sparkles, hint: 'Ask your AI tutor anything' },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare, hint: 'Kanban task board' },
      { id: 'study', label: 'Study Tracker', icon: Timer, hint: 'Pomodoro focus timer' },
      { id: 'content', label: 'Content Library', icon: BookOpen, hint: 'Notes, PDFs, links, videos' },
      { id: 'syllabus', label: 'Syllabus', icon: GraduationCap, hint: 'Course syllabi & modules' },
      { id: 'studyplan', label: 'Study Plan', icon: Target, hint: 'AI-generated study plan' },
      { id: 'courses', label: 'Courses', icon: BookOpen, hint: 'Course catalogue' },
      { id: 'skills', label: 'Skills', icon: Target, hint: 'Skill mastery & XP' },
      { id: 'rss', label: 'Education RSS', icon: Rss, hint: 'Curated education news' },
    ],
  },
  {
    title: 'Community',
    items: [
      { id: 'feed', label: 'Campus Feed', icon: Rss, hint: 'Share, like, comment' },
      { id: 'social', label: 'Friends & Rooms', icon: Users, hint: 'Messages & study rooms' },
      { id: 'find-fellow', label: 'Find Students', icon: MapPin, hint: 'Discover classmates' },
      { id: 'students', label: 'Student Profiles', icon: Users2, hint: 'Browse profiles' },
    ],
  },
  {
    title: 'Progress',
    items: [
      { id: 'achievements', label: 'Achievements', icon: Trophy, hint: 'Badges & milestones' },
      { id: 'games', label: 'Games', icon: Gamepad2, hint: 'Chess, Sudoku, Memory' },
      { id: 'cbt', label: 'CBT Exam', icon: ClipboardList, hint: 'Practice exams' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: UserCircle, hint: 'Your settings' },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'lecturer', label: 'Lecturer Portal', icon: BookOpen, roles: ['lecturer', 'admin', 'management'], hint: 'Grading & assignments' },
      { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, roles: ['admin', 'management'], hint: 'Users, reports, integrations' },
    ],
  },
];

/** All route ids (used to validate hashes). */
export const ROUTE_IDS = NAV_GROUPS.flatMap(g => g.items.map(i => i.id));

/** Primary mobile bottom-bar destinations. */
export const MOBILE_PRIMARY = ['dashboard', 'tasks', 'study', 'ai'];

export function canAccess(item: NavItem, role?: UserRole): boolean {
  if (!item.roles) return true;
  if (!role) return false;
  return item.roles.includes(role) || (item.roles.includes('management') && role === 'admin');
}

/** Nav groups filtered for a role, dropping empty groups. */
export function navGroupsForRole(role?: UserRole): NavGroup[] {
  return NAV_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => canAccess(i, role)) }))
    .filter(g => g.items.length > 0);
}

export function findNavItem(id: string): NavItem | undefined {
  return NAV_GROUPS.flatMap(g => g.items).find(i => i.id === id);
}

export function findGroupOf(id: string): string | undefined {
  return NAV_GROUPS.find(g => g.items.some(i => i.id === id))?.title;
}

/* ------------------------------------------------------------------ */
/* Hash routing                                                        */
/* ------------------------------------------------------------------ */

export const tabToPath = (tab: string) => `#/${tab}`;

export function tabFromHash(hash: string): string | null {
  const clean = (hash || '').replace(/^#\/?/, '').trim();
  if (!clean) return null;
  const id = clean.split('?')[0].split('/')[0];
  return ROUTE_IDS.includes(id) ? id : null;
}
