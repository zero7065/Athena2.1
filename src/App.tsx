import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Auth from './components/Auth';
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
import Homepage from './components/Homepage';
import SecretAdmin from './components/SecretAdmin';
import FloatingSupport from './components/FloatingSupport';
import FeedbackModal from './components/FeedbackModal';
import Confetti from './components/Confetti';
import { cn } from './lib/utils';
import { useKeyboardShortcuts } from './lib/useKeyboard';
import { useCurrentUser } from './hooks/useCurrentUser';
import { useTheme } from './context/ThemeContext';
import { LayoutDashboard, CheckSquare, Timer, Gamepad2, Trophy, Users, UserCircle, Sparkles, Menu, X, BookOpen, ShieldCheck } from 'lucide-react';

/**
 * Achievement Toast Notification
 * Displays when user unlocks an achievement
 */
  const AchievementToast: React.FC = () => {
  const { showAchievement, setShowAchievement } = useAuth();
  useEffect(() => {
    if (showAchievement) {
      setConfettiActive(true);
      const t = setTimeout(() => setShowAchievement(null), 4000);
      return () => clearTimeout(t);
    }
  }, [showAchievement, setShowAchievement]);
  if (!showAchievement) return null;
  const achievement = showAchievement as { title: string; description: string };
  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[200] animate-bounce">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4">
        <div className="text-2xl sm:text-3xl">&#127942;</div>
        <div>
          <p className="font-bold text-sm sm:text-base">Achievement Unlocked!</p>
          <p className="text-xs sm:text-sm opacity-90">{achievement.title} &mdash; {achievement.description}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Main App Content Component
 * Handles routing, authentication, and layout
 */
const AppContent: React.FC = () => {
  const { user, isLoading, logout, setShowAchievement } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const profile = useCurrentUser();

  // ============ STATE ============
  const [activeTab, setActiveTab] = useState(() => {
    if (user) return localStorage.getItem('athena_active_tab') || 'dashboard';
    return 'dashboard';
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('athena_sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [showHomepage, setShowHomepage] = useState(!user); // Show homepage when not logged in
  const [showFeedback, setShowFeedback] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // ============ HANDLERS ============

  /**
   * Handle window resize for mobile/desktop detection
   */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Handle tab navigation
   */
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setIsCollapsed(true);
  }, []);

  /**
   * Handle returning to homepage (from Sidebar)
   * Logs out user and shows homepage
   */
  const handleReturnHome = useCallback(() => {
    // Clear auth data (do NOT remove athena_users — that destroys all accounts)
    localStorage.removeItem('athena_auth');
    if (user?.email) {
      localStorage.removeItem(`app_data_${user.email}`);
    }
    
    // Logout
    logout();
    
    // Show homepage
    setShowHomepage(true);
    setShowAuth(false);
    setMobileMenuOpen(false);
    setActiveTab('dashboard');
  }, [user?.email, logout]);

  /**
   * Handle sign up from homepage
   */
  const handleSignUp = useCallback(() => {
    setShowAuth(true);
    setShowHomepage(false);
    setAuthMode('register');
  }, []);

  /**
   * Handle auth close and redirect to homepage
   */
  const handleAuthClose = useCallback(() => {
    setShowAuth(false);
    setShowHomepage(true);
  }, []);

  useKeyboardShortcuts(handleTabChange);

  /**
   * Mobile bottom navigation tabs
   * Dynamically includes role-based tabs
   */
  const mobileTabs = useMemo(() => {
    const tabs: Array<{ id: string; icon: typeof LayoutDashboard; label: string }> = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
      { id: 'ai', icon: Sparkles, label: 'AI' },
      { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
      { id: 'study', icon: Timer, label: 'Focus' },
      { id: 'games', icon: Gamepad2, label: 'Games' },
      { id: 'social', icon: Users, label: 'Social' },
      { id: 'achievements', icon: Trophy, label: 'Awards' },
      { id: 'profile', icon: UserCircle, label: 'Profile' },
    ];
    if (user?.role === 'lecturer') {
      tabs.splice(5, 0, { id: 'lecturer', icon: BookOpen, label: 'Lecturer' });
    }
    if (user?.role === 'admin') {
      tabs.push({ id: 'admin', icon: ShieldCheck, label: 'Admin' });
    }
    return tabs;
  }, [user?.role]);

  /**
   * Apply user theme preferences
   */
  useEffect(() => {
    if (profile) {
      document.documentElement.style.setProperty('--primary', profile.themeColor || '#00843D');
      const fonts: Record<string, string> = { sans: 'font-sans', mono: 'font-mono', serif: 'font-serif' };
      document.documentElement.className = document.documentElement.className
        .replace(/font-(sans|mono|serif)/g, '')
        .trim() + ' ' + (fonts[profile.fontPreference] || 'font-sans');
    }
  }, [profile]);

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('athena_sidebar_collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Save active tab for resume
  useEffect(() => {
    if (user) localStorage.setItem('athena_active_tab', activeTab);
  }, [activeTab, user]);

  // ============ SECRET ADMIN ROUTE ============
  if (typeof window !== 'undefined' && window.location.pathname === '/admin-secret') {
    return <SecretAdmin />;
  }

  // ============ LOADING STATE ============
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#00843D] font-bold animate-pulse uppercase tracking-widest text-xs">
            Initializing ATHENA...
          </p>
        </div>
      </div>
    );
  }

  // ============ NOT LOGGED IN - SHOW HOMEPAGE OR AUTH ============
  if (!user) {
    if (showHomepage) {
      return <Homepage onSignUp={handleSignUp} theme={theme} onToggleTheme={toggleTheme} />;
    }
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Auth 
          mode={authMode} 
          setMode={setAuthMode} 
          onClose={handleAuthClose} 
        />
      </div>
    );
  }

  // ============ CONTENT ROUTER ============
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={handleTabChange} />;
      case 'ai':
        return <AIChatbot />;
      case 'tasks':
        return <TaskBoard />;
      case 'study':
        return <StudyTracker />;
      case 'games':
        return <Games />;
      case 'achievements':
        return <Achievements />;
      case 'social':
        return <Social />;
      case 'profile':
        return <Profile />;
      case 'lecturer':
        return user.role === 'lecturer' ? <LecturerPortal /> : <Dashboard setActiveTab={handleTabChange} />;
      case 'admin':
        return user.role === 'admin' ? <AdminPanel /> : <Dashboard setActiveTab={handleTabChange} />;
      default:
        return <Dashboard setActiveTab={handleTabChange} />;
    }
  };

  // ============ LOGGED IN - SHOW MAIN APP ============
  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-500">
        {isMobile ? (
          <>
            {/* MOBILE: Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass px-3 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
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

            {/* MOBILE: Sidebar Menu (Overlay) */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 top-[52px] z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
                <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-52px)]">
                  <Sidebar 
                    activeTab={activeTab} 
                    setActiveTab={handleTabChange} 
                    isCollapsed={false} 
                    setIsCollapsed={() => {}} 
                    isMobile={true} 
                    onCloseMobile={() => setMobileMenuOpen(false)}
                    onReturnHome={handleReturnHome}
                  />
                </div>
              </div>
            )}

            {/* MOBILE: Main Content */}
            <main className="flex-1 pt-[52px] pb-[68px] overflow-y-auto min-h-screen">
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>

            {/* MOBILE: Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
              <div className="flex overflow-x-auto no-scrollbar">
                {mobileTabs.map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 px-1 transition-colors relative min-h-[44px] ${
                      activeTab === tab.id ? 'text-[#00843D]' : 'text-slate-400'
                    }`}>
                    <tab.icon size={18} className={activeTab === tab.id ? 'text-[#00843D]' : ''} />
                    <span className={`text-[10px] mt-0.5 font-semibold ${
                      activeTab === tab.id ? 'text-[#00843D]' : 'text-slate-400'
                    }`}>
                      {tab.label}
                    </span>
                    {activeTab === tab.id && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#00843D] rounded-b-full" />}
                  </button>
                ))}
              </div>
            </nav>
          </>
        ) : (
          <>
            {/* DESKTOP: Sidebar */}
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={handleTabChange} 
              isCollapsed={isCollapsed} 
              setIsCollapsed={setIsCollapsed} 
              isMobile={false}
              onReturnHome={handleReturnHome}
            />

            {/* DESKTOP: Main Content */}
            <main className={cn("flex-1 transition-all duration-300 min-h-screen overflow-y-auto", isCollapsed ? "ml-20" : "ml-64")}>
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>
          </>
        )}
      </div>

      {/* Achievement Toast */}
      <AchievementToast />

      {/* Floating Support Button — visible on all authenticated pages */}
      <FloatingSupport onOpenFeedback={() => setShowFeedback(true)} />

      {/* Feedback Modal */}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} onUnlockAchievement={(a) => setShowAchievement(a)} />}
      <Confetti active={confettiActive} onDone={() => setConfettiActive(false)} />
    </>
  );
};

/**
 * Root App Component
 * Wraps content with Auth and Theme providers
 */
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}