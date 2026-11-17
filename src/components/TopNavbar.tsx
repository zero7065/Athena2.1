import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown, Sparkles, Moon, Sun, LogOut, UserCircle, Menu,
  Home, LayoutGrid, Bell, CheckCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { navGroupsForRole, findNavItem, findGroupOf, type NavGroup } from '../lib/routes';
import { getNotifications, unreadNotificationCount, markNotificationsRead } from '../lib/social';
import type { UserRole } from '../types';

interface TopNavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenMenu?: () => void;
  isMobile?: boolean;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ activeTab, onNavigate, onOpenMenu, isMobile }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [userMenu, setUserMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTick, setNotifTick] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = useMemo(() => getNotifications(user?.email), [user?.email, notifTick]);
  const unread = useMemo(() => unreadNotificationCount(user?.email), [user?.email, notifTick]);

  useEffect(() => {
    const t = setInterval(() => setNotifTick(v => v + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const groups: NavGroup[] = useMemo(
    () => navGroupsForRole(user?.role as UserRole | undefined),
    [user?.role]
  );

  const current = findNavItem(activeTab);
  const currentGroup = findGroupOf(activeTab);

  // Close menus on outside click / Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpenGroup(null); setUserMenu(false); setNotifOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const go = (id: string) => {
    onNavigate(id);
    setOpenGroup(null);
    setUserMenu(false);
  };

  /* ---------------- Mobile top bar ---------------- */
  if (isMobile) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200 dark:border-slate-800">
        <div className="h-14 px-2 flex items-center gap-2">
          <button
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 leading-none">
              {currentGroup || 'AcademiaIQ'}
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate leading-tight">
              {current?.label || 'Dashboard'}
            </p>
          </div>

          <button
            onClick={() => go('ai')}
            aria-label="AI Assistant"
            className="p-2 rounded-xl bg-[#00843D]/10 text-[#00843D] min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Sparkles size={20} />
          </button>

          <button
            onClick={() => go('feed')}
            aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
            className="relative p-2 rounded-xl text-slate-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <button
            onClick={() => go('profile')}
            aria-label="Profile"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00843D] to-emerald-500 text-white font-bold text-xs flex items-center justify-center"
          >
            {user?.name?.[0] || 'S'}
          </button>
        </div>
      </header>
    );
  }

  /* ---------------- Desktop top bar ---------------- */
  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200 dark:border-slate-800">
      <div className="h-16 px-4 lg:px-6 flex items-center gap-3">
        {/* Brand */}
        <button onClick={() => go('dashboard')} className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-9 h-9 rounded-xl bg-[#00843D] text-white flex items-center justify-center shadow-lg shadow-[#00843D]/20">
            <Sparkles size={18} />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-sm font-black tracking-tight text-slate-800 dark:text-white leading-none">AcademiaIQ</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#00843D] leading-none mt-1">Student Platform</span>
          </div>
        </button>

        {/* Categorized nav */}
        <nav ref={navRef} className="flex items-center gap-0.5" aria-label="Primary">
          {groups.map(group => {
            const isActiveGroup = currentGroup === group.title;
            const open = openGroup === group.title;
            return (
              <div key={group.title} className="relative">
                <button
                  onClick={() => setOpenGroup(open ? null : group.title)}
                  aria-haspopup="true"
                  aria-expanded={open}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all min-h-[40px]',
                    isActiveGroup || open
                      ? 'bg-[#00843D]/10 text-[#00843D]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {group.title}
                  <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
                </button>

                {open && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full mt-1.5 w-64 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl animate-slide-down z-50"
                  >
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          role="menuitem"
                          onClick={() => go(item.id)}
                          className={cn(
                            'w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all',
                            active
                              ? 'bg-[#00843D]/10 text-[#00843D]'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                          )}
                        >
                          <Icon size={18} className={cn('mt-0.5 shrink-0', active ? 'text-[#00843D]' : 'text-slate-400')} />
                          <span className="min-w-0">
                            <span className="block text-sm font-bold leading-tight">{item.label}</span>
                            {item.hint && <span className="block text-[10px] text-slate-400 leading-tight mt-0.5">{item.hint}</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={() => go('dashboard')}
            aria-label="Home"
            className={cn(
              'p-2 rounded-xl transition-all min-h-[40px] min-w-[40px] flex items-center justify-center',
              activeTab === 'dashboard'
                ? 'bg-[#00843D]/10 text-[#00843D]'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Home size={18} />
          </button>
          <button
            onClick={() => go('ai')}
            aria-label="AI Assistant"
            className={cn(
              'p-2 rounded-xl transition-all min-h-[40px] min-w-[40px] flex items-center justify-center',
              activeTab === 'ai'
                ? 'bg-[#00843D]/10 text-[#00843D]'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <LayoutGrid size={18} />
          </button>
        </nav>

        {/* Right utilities */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(v => !v)}
              aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
              aria-expanded={notifOpen}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-80 max-w-[calc(100vw-2rem)] p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl animate-slide-down z-50">
                <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Notifications</p>
                  {unread > 0 && (
                    <button
                      onClick={() => { markNotificationsRead(user?.email || ''); setNotifTick(v => v + 1); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-3 py-6 text-center text-[11px] text-slate-400">You're all caught up.</p>
                  ) : (
                    notifications.slice(0, 20).map(n => (
                      <div key={n.id} className={cn('px-2.5 py-2 rounded-xl mb-0.5', n.read ? '' : 'bg-primary/5')}>
                        <p className="text-[11px] text-slate-700 dark:text-slate-200">
                          <span className="font-bold">{n.fromName}</span> {n.text}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {n.kind} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenu(v => !v)}
              aria-haspopup="true"
              aria-expanded={userMenu}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all min-h-[40px]"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00843D] to-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                {user?.name?.[0] || 'S'}
              </span>
              <span className="hidden lg:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">{user?.name}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 capitalize mt-0.5">{user?.role}</span>
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {userMenu && (
              <div role="menu" className="absolute right-0 top-full mt-1.5 w-56 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl animate-slide-down z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <button role="menuitem" onClick={() => go('profile')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <UserCircle size={16} /> Profile & Settings
                </button>
                <button role="menuitem" onClick={() => go('ai')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Sparkles size={16} /> AI Assistant
                </button>
                <button role="menuitem" onClick={() => { setUserMenu(false); logout(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
