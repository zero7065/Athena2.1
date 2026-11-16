import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AIProvider } from './context/AIContext';
import Auth from './components/Auth';
import LecturerAuth from './components/LecturerAuth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import StudyTracker from './components/StudyTracker';
import Achievements from './components/Achievements';
import Social from './components/Social';
import Profile from './components/Profile';
import AIChatbot from './components/AIChatbot';
import Homepage from './components/Homepage';
import SecretAdmin from './components/SecretAdmin';
import ContentLibrary from './components/ContentLibrary';
import SyllabusManager from './components/SyllabusManager';
import StudyPlan from './components/StudyPlan';
import StudentProfiles from './components/StudentProfiles';
import StudentDashboard from './components/StudentDashboard';
import LecturerDashboard from './components/LecturerDashboard';
import EduRSS from './components/EduRSS';
import Skills from './components/Skills';
import FindFellowStudents from './components/FindFellowStudents';
import CourseList from './components/CourseList';
import HowToGuide from './components/HowToGuide';
import Terminal from './components/Terminal';
import FloatingSupport from './components/FloatingSupport';
import FeedbackModal from './components/FeedbackModal';
import Confetti from './components/Confetti';
import InstallPrompt from './components/InstallPrompt';
import AIFloatingButton from './components/AIFloatingButton';
import AIChatSidebar from './components/AIChatSidebar';
import TopNavbar from './components/TopNavbar';
import { tabToPath, tabFromHash, MOBILE_PRIMARY, findNavItem } from './lib/routes';
import { cn } from './lib/utils';
import { useKeyboardShortcuts } from './lib/useKeyboard';
import { useCurrentUser } from './hooks/useCurrentUser';
import { useTheme } from './context/ThemeContext';
import { Menu } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

const Games = lazy(() => import('./components/Games'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const LecturerPortal = lazy(() => import('./components/LecturerPortal'));
const CBTExam = lazy(() => import('./components/CBTExam'));

/**
 * Main App Content Component
 * Handles routing, authentication, and layout
 */
const AppContent: React.FC = () => {
  const { user, isLoading, logout, showAchievement, setShowAchievement, knownAccounts, setAdminClickCount, showTerminal, setShowTerminal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const profile = useCurrentUser();

  // ============ STATE ============
  const [activeTab, setActiveTab] = useState(() => {
    const fromHash = tabFromHash(window.location.hash);
    if (fromHash) return fromHash;
    if (user) return localStorage.getItem('unipulse_active_tab') || 'dashboard';
    return 'dashboard';
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('unipulse_sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [, setShowAuth] = useState(false);
  const [showLecturerAuth, setShowLecturerAuth] = useState(false);
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
   * Handle tab navigation (also updates the URL hash route)
   */
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setIsCollapsed(true);
    if (typeof window !== 'undefined' && window.location.hash !== tabToPath(tab)) {
      try {
        window.history.pushState(null, '', tabToPath(tab));
      } catch {
        window.location.hash = tabToPath(tab);
      }
    }
  }, []);

  /**
   * Sync route hash <-> active tab (deep links, back/forward)
   */
  useEffect(() => {
    const syncFromHash = () => {
      const fromHash = tabFromHash(window.location.hash);
      if (fromHash) setActiveTab(fromHash);
    };
    if (user) {
      const fromHash = tabFromHash(window.location.hash);
      if (fromHash) setActiveTab(fromHash);
      else {
        try { window.history.replaceState(null, '', tabToPath(activeTab)); } catch { /* ignore */ }
      }
    }
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * Handle returning to homepage (from Sidebar)
   * Logs out user and shows homepage
   */
  const handleReturnHome = useCallback(() => {
    logout();
    setShowHomepage(true);
    setShowAuth(false);
    setMobileMenuOpen(false);
    setActiveTab('dashboard');
  }, [logout]);

  /**
   * Handle sign up from homepage
   */
  const handleSignUp = useCallback(() => {
    setShowAuth(true);
    setShowLecturerAuth(false);
    setShowHomepage(false);
    setAuthMode('register');
  }, []);

  /**
   * Handle lecturer auth from homepage
   */
  const handleLecturerAuth = useCallback(() => {
    setShowLecturerAuth(true);
    setShowAuth(false);
    setShowHomepage(false);
  }, []);

  /**
   * Handle auth close and redirect to homepage
   */
  const handleAuthClose = useCallback(() => {
    setShowAuth(false);
    setShowLecturerAuth(false);
    setShowHomepage(true);
  }, []);

  useKeyboardShortcuts(handleTabChange);

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

  // Trigger confetti on achievement unlock
  useEffect(() => {
    if (showAchievement) {
      setConfettiActive(true);
      const t = setTimeout(() => setShowAchievement(null), 4000);
      return () => clearTimeout(t);
    }
  }, [showAchievement, setShowAchievement]);

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('unipulse_sidebar_collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Save active tab for resume
  useEffect(() => {
    if (user) localStorage.setItem('unipulse_active_tab', activeTab);
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
            Initializing AcademiaIQ...
          </p>
        </div>
      </div>
    );
  }

  // ============ NOT LOGGED IN - SHOW HOMEPAGE OR AUTH ============
  if (!user) {
    if (showHomepage) {
      return <Homepage onSignUp={handleSignUp} onLecturer={handleLecturerAuth} theme={theme} onToggleTheme={toggleTheme} />;
    }
    
    if (showLecturerAuth) {
      return <LecturerAuth onBack={handleAuthClose} />;
    }
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Auth 
          mode={authMode} 
          setMode={setAuthMode} 
          onClose={handleAuthClose}
          knownAccounts={knownAccounts}
        />
      </div>
    );
  }

  // ============ CONTENT ROUTER ============
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'student' ? <StudentDashboard setActiveTab={handleTabChange} />
          : user.role === 'lecturer' || user.role === 'admin' || user.role === 'management' ? <LecturerDashboard />
          : <Dashboard setActiveTab={handleTabChange} />;
      case 'ai':
        return <AIChatbot />;
      case 'tasks':
        return <TaskBoard />;
      case 'study':
        return <StudyTracker />;
      case 'games':
        return <Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-slate-500">Loading games…</div>}><Games /></Suspense>;
      case 'cbt':
        return <Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-slate-500">Loading exam…</div>}><CBTExam /></Suspense>;
      case 'achievements':
        return <Achievements />;
      case 'social':
        return <Social />;
      case 'find-fellow':
        return <FindFellowStudents />;
      case 'students':
        return <StudentProfiles />;
      case 'rss':
        return <EduRSS />;
      case 'profile':
        return <Profile />;
      case 'content':
        return <ContentLibrary />;
      case 'syllabus':
        return <SyllabusManager />;
      case 'studyplan':
        return <StudyPlan />;
      case 'skills':
        return <Skills />;
      case 'courses':
        return <CourseList />;
      case 'lecturer':
        return <Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-slate-500">Loading lecturer portal…</div>}><LecturerPortal /></Suspense>;
      case 'admin':
        return <Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-slate-500">Loading admin panel…</div>}><AdminPanel /></Suspense>;
      default:
        return <Dashboard setActiveTab={handleTabChange} />;
    }
  };

  // ============ LOGGED IN - SHOW MAIN APP ============
  return (
    <ErrorBoundary>
      <>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-500">
        {isMobile ? (
          <>
            {/* MOBILE: Top Navigation (categorized menu via drawer) */}
            <TopNavbar
              isMobile
              activeTab={activeTab}
              onNavigate={handleTabChange}
              onOpenMenu={() => setMobileMenuOpen(true)}
            />

            {/* MOBILE: Categorized Menu (Overlay drawer) */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 top-14 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-56px)]">
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
            <main className="flex-1 pt-14 pb-[68px] overflow-y-auto min-h-screen">
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>

            {/* MOBILE: Bottom Navigation (primary routes + More) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
              <div className="flex">
                {MOBILE_PRIMARY.map(id => {
                  const item = findNavItem(id);
                  if (!item) return null;
                  const Icon = item.icon;
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleTabChange(id)}
                      aria-label={item.label}
                      className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 px-1 transition-colors relative min-h-[56px] ${
                        active ? 'text-[#00843D]' : 'text-slate-400'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-[10px] mt-0.5 font-semibold">{item.label.split(' ')[0]}</span>
                      {active && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#00843D] rounded-b-full" />}
                    </button>
                  );
                })}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="More"
                  className="flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 px-1 transition-colors relative min-h-[56px] text-slate-400"
                >
                  <Menu size={20} />
                  <span className="text-[10px] mt-0.5 font-semibold">More</span>
                </button>
              </div>
            </nav>
          </>
        ) : (
          <>
            {/* DESKTOP: Categorized Sidebar (deep navigation) */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
              isMobile={false}
              onReturnHome={handleReturnHome}
            />

            {/* DESKTOP: Column = top navbar + content */}
            <div className={cn('flex-1 flex flex-col min-h-screen transition-all duration-300', isCollapsed ? 'ml-20' : 'ml-64')}>
              <TopNavbar activeTab={activeTab} onNavigate={handleTabChange} />
              <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                  {renderContent()}
                </div>
              </main>
            </div>
          </>
        )}
      </div>

      {/* Achievement Toast */}
      {showAchievement && (() => {
        const a = showAchievement as { title: string; description: string };
        return (
          <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[200] animate-bounce">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4">
              <div className="text-2xl sm:text-3xl">&#127942;</div>
              <div>
                <p className="font-bold text-sm sm:text-base">Achievement Unlocked!</p>
                <p className="text-xs sm:text-sm opacity-90">{a.title} &mdash; {a.description}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Floating Support Button — visible on all authenticated pages */}
      <FloatingSupport onOpenFeedback={() => setShowFeedback(true)} />

      {/* Feedback Modal */}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} onUnlockAchievement={(a) => setShowAchievement(a)} />}
      {showTerminal && <Terminal onClose={() => { setShowTerminal(false); setAdminClickCount(0); }} />}
      <Confetti active={confettiActive} onDone={() => setConfettiActive(false)} />
      {/* How To Guide */}
      {user && <HowToGuide />}

      {/* Floating AI Assistant Button */}
      <AIFloatingButton />

      {/* AI Chat Sidebar */}
      <AIChatSidebar />
      </>
    </ErrorBoundary>
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
        <AIProvider>
          <AppContent />
        </AIProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}