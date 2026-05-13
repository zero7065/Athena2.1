import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  Gamepad2, 
  Trophy, 
  Users, 
  UserCircle, 
  Star,
  LogOut,
  BookOpen,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, isMobile, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'study', label: 'Study Tracker', icon: Timer },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'social', label: 'Friends & Rooms', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  if (user?.role === 'lecturer') {
    menuItems.splice(4, 0, { id: 'lecturer', label: 'Lecturer Portal', icon: BookOpen });
  }
  if (user?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  const handleNav = (id: string) => {
    setActiveTab(id);
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 bg-[#00843D] rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Star size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tighter text-slate-800 dark:text-white leading-none">ATHENA</span>
            <span className="text-[8px] text-[#00843D] font-bold uppercase tracking-widest leading-none mt-0.5">PLASU Edition</span>
          </div>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => handleNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                activeTab === item.id ? "bg-[#00843D] text-white shadow-md" : "hover:bg-[#00843D]/10 text-slate-600 dark:text-slate-300"
              )}>
              <item.icon size={20} className={activeTab === item.id ? "text-white" : "text-[#00843D]"} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="font-bold text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 z-50 transition-all duration-300 flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-5 flex items-center justify-between relative">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#00843D] rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
              <Star size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-slate-800 dark:text-white leading-none">ATHENA</span>
              <span className="text-[7px] text-[#00843D] font-bold uppercase tracking-widest leading-none mt-0.5">PLASU Edition</span>
            </div>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("p-2 hover:bg-[#00843D]/10 rounded-xl transition-colors text-[#00843D]", isCollapsed && "mx-auto")}
          title={isCollapsed ? "Expand Menu" : "Collapse Menu"} aria-label={isCollapsed ? "Expand Menu" : "Collapse Menu"}>
          {isCollapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          )}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative min-h-[44px]",
              activeTab === item.id ? "bg-[#00843D] text-white shadow-md" : "hover:bg-[#00843D]/10 text-slate-600 dark:text-slate-300"
            )}>
            <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-[#00843D] group-hover:scale-110 transition-transform", isCollapsed && "mx-auto")} />
            {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 mt-auto border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button onClick={() => setActiveTab('profile')}
          className={cn("flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all", isCollapsed ? "justify-center" : "")}>
          <div className="w-9 h-9 rounded-xl bg-[#00843D]/10 flex items-center justify-center text-[#00843D] font-bold shrink-0 text-sm">
            {user?.name?.[0] || 'S'}
          </div>
          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#00843D] uppercase">{user?.name?.[0] || 'S'}</span>
              </div>
            </div>
          )}
        </button>

        <button onClick={toggleTheme}
          className={cn("w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 min-h-[44px]", isCollapsed ? "justify-center" : "")}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          {!isCollapsed && <span className="font-bold text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        <button onClick={logout}
          className={cn("w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors min-h-[44px]", isCollapsed ? "justify-center" : "")}>
          <LogOut size={20} />
          {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
