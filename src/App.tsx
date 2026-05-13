import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './components/Landing';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import StudyTracker from './components/StudyTracker';
import Games from './components/Games';
import Achievements from './components/Achievements';
import Social from './components/Social';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import LecturerPortal from './components/LecturerPortal';
import AIChatbot from './components/AIChatbot';
import { cn } from './lib/utils';
import { useKeyboardShortcuts } from './lib/useKeyboard';
import { LayoutDashboard, CheckSquare, Timer, Gamepad2, Trophy, Users, UserCircle, Sparkles, Menu, X } from 'lucide-react';

const AchievementToast: React.FC = () => {
  const { showAchievement, setShowAchievement } = useAuth();
  useEffect(() => {
    if (showAchievement) {
      const t = setTimeout(() => setShowAchievement(null), 4000);
      return () => clearTimeout(t);
    }
  }, [showAchievement, setShowAchievement]);
  if (!showAchievement) return null;
  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[200] animate-bounce">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4">
        <div className="text-2xl sm:text-3xl">&#127942;</div>
        <div>
          <p className="font-bold text-sm sm:text-base">Achievement Unlocked!</p>
          <p className="text-xs sm:text-sm opacity-90">{showAchievement.title} &mdash; {showAchievement.description}</p>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setIsCollapsed(true);
  }, []);

  useKeyboardShortcuts(handleTabChange);

  useEffect(() => {
    if (user) {
      document.documentElement.style.setProperty('--primary', user.themeColor || '#00843D');
      const fonts: Record<string, string> = { sans: 'font-sans', mono: 'font-mono', serif: 'font-serif' };
      document.documentElement.className = document.documentElement.className
        .replace(/font-(sans|mono|serif)/g, '')
        .trim() + ' ' + (fonts[user.fontPreference] || 'font-sans');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#00843D] font-bold animate-pulse uppercase tracking-widest text-xs">Initializing ATHENA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={handleTabChange} />;
      case 'ai': return <AIChatbot />;
      case 'tasks': return <TaskBoard />;
      case 'study': return <StudyTracker />;
      case 'games': return <Games />;
      case 'achievements': return <Achievements />;
      case 'social': return <Social />;
      case 'profile': return <Profile />;
      case 'lecturer': return user.role === 'lecturer' ? <LecturerPortal /> : <Dashboard setActiveTab={handleTabChange} />;
      case 'admin': return user.isAdmin ? <AdminPanel /> : <Dashboard setActiveTab={handleTabChange} />;
      default: return <Dashboard setActiveTab={handleTabChange} />;
    }
  };

  const mobileTabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'study', icon: Timer, label: 'Focus' },
    { id: 'games', icon: Gamepad2, label: 'Games' },
    { id: 'social', icon: Users, label: 'Social' },
    { id: 'achievements', icon: Trophy, label: 'Awards' },
    { id: 'profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-500">
        {isMobile ? (
          <>
            <nav className="fixed top-0 left-0 right-0 z-50 glass px-3 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#00843D] rounded-lg flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <span className="font-bold text-sm">ATHENA</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#00843D]/10 flex items-center justify-center text-[#00843D] font-bold text-xs">
                {user.name?.[0] || 'S'}
              </div>
            </nav>
            {mobileMenuOpen && (
              <div className="fixed inset-0 top-[52px] z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
                <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-52px)]">
                  <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} isCollapsed={false} setIsCollapsed={() => {}} isMobile={true} onCloseMobile={() => setMobileMenuOpen(false)} />
                </div>
              </div>
            )}
            <main className="flex-1 pt-[52px] pb-[68px] overflow-y-auto min-h-screen">
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
              <div className="flex overflow-x-auto no-scrollbar">
                {mobileTabs.map(tab => (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 px-1 transition-colors relative min-h-[44px] ${activeTab === tab.id ? 'text-[#00843D]' : 'text-slate-400'}`}>
                    <tab.icon size={18} className={activeTab === tab.id ? 'text-[#00843D]' : ''} />
                    <span className={`text-[10px] mt-0.5 font-semibold ${activeTab === tab.id ? 'text-[#00843D]' : 'text-slate-400'}`}>{tab.label}</span>
                    {activeTab === tab.id && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#00843D] rounded-b-full" />}
                  </button>
                ))}
              </div>
            </nav>
          </>
        ) : (
          <>
            <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobile={false} />
            <main className={cn("flex-1 transition-all duration-300 min-h-screen overflow-y-auto", isCollapsed ? "ml-20" : "ml-64")}>
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>
          </>
        )}
      </div>
      <AchievementToast />
    </>
  );
};

import { FirebaseAuthProvider } from './context/FirebaseAuthContext';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FirebaseAuthProvider>
          <AppContent />
        </FirebaseAuthProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
