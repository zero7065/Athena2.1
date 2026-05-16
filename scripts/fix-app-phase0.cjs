const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const appPath = path.join(root, 'src', 'App.tsx');

let src = execSync('git show HEAD:src/App.tsx', { encoding: 'utf8', cwd: root });

src = src.replace("import Landing from './components/Landing';\n", '');
src = src.replace(
  "import { useKeyboardShortcuts } from './lib/useKeyboard';\nimport { LayoutDashboard",
  "import { useKeyboardShortcuts } from './lib/useKeyboard';\nimport { useCurrentUser } from './hooks/useCurrentUser';\nimport { LayoutDashboard"
);
src = src.replace(
  '<p className="text-xs sm:text-sm opacity-90">{showAchievement.title} &mdash; {showAchievement.description}</p>',
  '<p className="text-xs sm:text-sm opacity-90">{achievement.title} &mdash; {achievement.description}</p>'
);
src = src.replace(
  '  if (!showAchievement) return null;\n  return (',
  '  if (!showAchievement) return null;\n  const achievement = showAchievement as { title: string; description: string };\n  return ('
);
src = src.replace(
  'const AppContent: React.FC = () => {\n  const { user, isLoading } = useAuth();',
  'const AppContent: React.FC = () => {\n  const { user, isLoading } = useAuth();\n  const profile = useCurrentUser();'
);
src = src.replace(
  "const [isMobile, setIsMobile] = useState(window.innerWidth < 768);",
  "const [isMobile, setIsMobile] = useState(window.innerWidth < 768);\n  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');"
);

const mobileTabsBlock = `  const mobileTabs = useMemo(() => {
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

`;

src = src.replace(
  '  useKeyboardShortcuts(handleTabChange);\n\n  useEffect(() => {\n    if (user) {',
  `  useKeyboardShortcuts(handleTabChange);\n\n${mobileTabsBlock}  useEffect(() => {\n    if (profile) {`
);
src = src.replace(
  "document.documentElement.style.setProperty('--primary', user.themeColor || '#00843D');",
  "document.documentElement.style.setProperty('--primary', profile.themeColor || '#00843D');"
);
src = src.replace('fonts[user.fontPreference]', 'fonts[profile.fontPreference]');
src = src.replace('  }, [user]);', '  }, [profile]);');
src = src.replace(
  '<Auth mode="login" setMode={() => {}} onClose={() => {}} />',
  '<Auth mode={authMode} setMode={setAuthMode} onClose={() => {}} />'
);

src = src.replace(
  /\n  const mobileTabs = useMemo\(\(\) => \{[\s\S]*?\}, \[user\?\.role\]\);\n\n  return \(/,
  '\n  return ('
);

fs.writeFileSync(appPath, src, 'utf8');
console.log('Fixed App.tsx');
