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
  Sparkles,
  Home,
  ArrowLeft
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
  onReturnHome?: () => void; // New prop for homepage
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  isMobile, 
  onCloseMobile,
  onReturnHome 
}) => {
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

  // Role-based menu items
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

  // Enhanced logout with full session clearing
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('athena_auth');
    localStorage.removeItem('athena_users');
    
    // Clear app data by email if available
    if (user?.email) {
      localStorage.removeItem(`app_data_${user.email}`);
    }

    // Call logout from auth context
    logout();

    // Close mobile menu if open
    if (isMobile && onCloseMobile) onCloseMobile();

    // Redirect to home
    if (onReturnHome) {
      onReturnHome();
    } else {
      window.location.href = '/';
    }
  };

  // Return to homepage handler
  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      window.location.href = '/';
    }
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 bg-[#00843D] rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Star size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tighter text-slate-800 dark:text-white leading-none">ATHENA</span>
            <span className="text-[8px] text-[#00843D] font-bold uppercase tracking-widest leading-none mt-0.5">PLASU Edition</span>
          </div>
        </div>

        {/* Home Button */}
        <button onClick={handleReturnHome}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#00843D]/10 hover:bg-[#00843D]/20 text-[#00843D] font-bold transition-all">
          <ArrowLeft size={20} />
          <span className="text-sm">Return to Home</span>
        </button>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => handleNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                activeTab === item.id 
                  ? "bg-[#00843D] text-white shadow-md" 
                  : "hover:bg-[#00843D]/10 text-slate-600 dark:text-slate-300"
              )}>
              <item.icon size={20} className={activeTab === item.id ? "text-white" : "text-[#00843D]"} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="font-bold text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={20} />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 z-50 transition-all duration-300 flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Section */}
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
          title={isCollapsed ? "Expand Menu" : "Collapse Menu"} 
          aria-label={isCollapsed ? "Expand Menu" : "Collapse Menu"}>
          {isCollapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          )}
        </button>
      </div>

      {/* Home Button */}
      <div className="px-3 mb-2">
        <button onClick={handleReturnHome}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl bg-[#00843D]/10 hover:bg-[#00843D]/20 text-[#00843D] font-bold transition-all min-h-[44px]",
            isCollapsed && "justify-center"
          )}
          title="Return to Homepage">
          <Home size={20} />
          {!isCollapsed && <span className="text-sm">Home</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative min-h-[44px]",
              activeTab === item.id 
                ? "bg-[#00843D] text-white shadow-md" 
                : "hover:bg-[#00843D]/10 text-slate-600 dark:text-slate-300"
            )}>
            <item.icon size={20} className={cn(
              activeTab === item.id ? "text-white" : "text-[#00843D] group-hover:scale-110 transition-transform", 
              isCollapsed && "mx-auto"
            )} />
            {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Profile & Actions */}
      <div className="p-3 mt-auto border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* User Profile Card */}
        <button onClick={() => setActiveTab('profile')}
          className={cn("flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-h-[44px]", isCollapsed ? "justify-center" : "")}>
          <div className="w-9 h-9 rounded-xl bg-[#00843D]/10 flex items-center justify-center text-[#00843D] font-bold shrink-0 text-sm">
            {user?.name?.[0] || 'S'}
          </div>
          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          )}
        </button>

        {/* Theme Toggle */}
        <button onClick={toggleTheme}
          className={cn("w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 min-h-[44px]", isCollapsed ? "justify-center" : "")}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          {!isCollapsed && <span className="font-bold text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        {/* Logout Button */}
        <button onClick={handleLogout}
          className={cn("w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]", isCollapsed ? "justify-center" : "")}>
          <LogOut size={20} />
          {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
        </button>
      </div>

      {/* Future Enhancement Hooks (Development Ready) */}
      {/* 
        FUTURE ENHANCEMENTS - Ready to integrate:
        
        1. Notifications Badge:
           - Add <NotificationBadge count={unreadCount} /> above profile
           
        2. Online Status Indicator:
           - Add green dot on profile avatar when online
           
        3. Quick Actions Menu:
           - Add floating menu for common actions
           
        4. Sidebar Search:
           - Add search input above navigation
           
        5. Favorites/Pinned Items:
           - Allow users to pin frequently used tabs
           
        6. Custom Themes:
           - Add more theme options beyond light/dark
           
        7. Sidebar Width Customization:
           - Remember collapsed state in localStorage
           
        8. Keyboard Shortcuts Display:
           - Show shortcut hints on hover
      */}
    </aside>
  );
};

export default Sidebar;