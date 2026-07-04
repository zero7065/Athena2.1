import React, { useMemo } from 'react';
import { Calendar, CheckSquare, Zap, Users, TrendingUp, Flame, Star, School, MessageSquare, Sparkles, Brain, Trophy, BookOpen, Target, Clock, Quote } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { calcLevel, xpForNextLevel } from '../lib/storage';

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { appData, user } = useAuth();
  const profile = useCurrentUser();
  const tasks = appData.tasks;
  const sessions = appData.sessions;
  const achievements = appData.achievements;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const encouragements = [
    'Your academic performance is looking sharp today.',
    'Keep pushing — excellence is a habit, not an act.',
    'Every study session brings you closer to your goals.',
    'Great things never come from comfort zones.',
    'Success is the sum of small efforts repeated daily.',
    'Your potential is endless. Keep learning!',
  ];
  const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  const avgFocus = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length * 10) / 10
    : 0;

  const xp = profile?.xp ?? 0;
  const level = calcLevel(xp);
  const currentLevelXp = xpForNextLevel(level - 1);
  const nextLevelXp = xpForNextLevel(level);
  const progressInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progressPct = Math.min(100, Math.round((progressInLevel / (xpNeeded || 1)) * 100));

  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(t => t.status !== 'done').length, [tasks]);
  const totalSessions = sessions.length;
  const unlockedAchievements = useMemo(() => achievements.filter(a => a.unlockedAt !== null).length, [achievements]);

  const widgets = [
    {
      id: 'ai-assistant', title: 'ATHENA AI', icon: Sparkles, color: 'text-primary',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">Your academic assistant is ready to help with your studies.</p>
          <button onClick={() => setActiveTab?.('ai')}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
            <MessageSquare size={16} /> Ask ATHENA
          </button>
        </div>
      )
    },
    {
      id: 'tasks-preview', title: 'Tasks', icon: CheckSquare, color: 'text-primary',
      content: (
        <div className="space-y-2">
          {tasks.filter(t => t.status !== 'done').slice(0, 4).map(t => (
            <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-medium truncate max-w-[140px]">{t.title}</span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", t.priority === 'high' ? "bg-red-100 text-red-600" : t.priority === 'medium' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500")}>{t.priority}</span>
            </div>
          ))}
          {tasks.filter(t => t.status !== 'done').length === 0 && <p className="text-xs text-slate-400 italic py-4 text-center">No pending tasks.</p>}
          <button onClick={() => setActiveTab?.('tasks')} className="w-full text-center text-[10px] font-bold text-primary hover:underline pt-1">View All Tasks</button>
        </div>
      )
    },
    {
      id: 'focus-score', title: 'Focus Score', icon: Zap, color: 'text-amber-500',
      content: (
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-4xl font-bold gradient-text">{avgFocus.toFixed(1) || '0.0'}</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase mt-1">Average Focus</span>
          <div className="w-full mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <TrendingUp size={24} className="mx-auto text-emerald-500 mb-1" />
            <p className="text-[10px] text-slate-400 font-medium">{sessions.length} sessions logged</p>
          </div>
        </div>
      )
    },
    {
      id: 'xp-progress', title: 'Level Progress', icon: Star, color: 'text-amber-500',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold gradient-text">Level {level}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold">{xp} XP</span>
            </div>
            <Target size={18} className="text-amber-400" />
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400 font-medium">{progressInLevel} / {xpNeeded} XP</span>
            <span className="text-primary font-bold">{xpNeeded - progressInLevel} XP to Level {level + 1}</span>
          </div>
        </div>
      )
    },
    {
      id: 'achievements', title: 'Achievements', icon: Trophy, color: 'text-amber-500',
      content: (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">{unlockedAchievements}/{achievements.length} unlocked</p>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", unlockedAchievements === achievements.length ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
              {Math.round((unlockedAchievements / achievements.length) * 100)}%
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {achievements.filter(a => a.unlockedAt !== null).slice(0, 8).map(a => (
              <div key={a.id} className="w-full aspect-square rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center text-emerald-500 text-lg shadow-sm border border-emerald-200 dark:border-emerald-800" title={a.title}>
                {'\u2B50'}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 8 - unlockedAchievements) }).map((_, i) => (
              <div key={`locked-${i}`} className="w-full aspect-square rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-600 text-lg border border-slate-100 dark:border-slate-700">
                ?
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab?.('achievements')} className="w-full text-center text-[10px] font-bold text-primary hover:underline pt-1">View All Achievements</button>
        </div>
      )
    },
    {
      id: 'friend-activity', title: 'Friend Activity', icon: Users, color: 'text-indigo-500',
      content: (
        <div className="space-y-2">
          {appData.friends.filter(f => f.online).slice(0, 3).map(f => (
            <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">{f.name[0]}</div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate block">{f.name}</span>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
              </span>
            </div>
          ))}
          {appData.friends.filter(f => f.online).length === 0 && (
            <div className="text-center py-4">
              <Users size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-400 font-medium">No friends online</p>
              <button onClick={() => setActiveTab?.('social')} className="text-[10px] font-bold text-primary hover:underline mt-1">Add Friends</button>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'study-progress', title: 'Study Progress', icon: BookOpen, color: 'text-blue-500',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalSessions}</p>
              <p className="text-[9px] font-bold text-blue-500/70 uppercase tracking-wider">Sessions</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-center">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{completedTasks}</p>
              <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-wider">Done</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 text-center">
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{appData.friends.length}</p>
              <p className="text-[9px] font-bold text-purple-500/70 uppercase tracking-wider">Friends</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-center">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{Object.values(appData.gameScores).reduce((a, b) => a + b, 0)}</p>
              <p className="text-[9px] font-bold text-amber-500/70 uppercase tracking-wider">Games</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'plasu-info', title: 'PLASU Bokkos', icon: School, color: 'text-accent',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
            <School size={32} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-blue-700 dark:text-blue-300">Plateau State University</p>
              <p className="text-[9px] text-blue-500/70 font-medium">Bokkos, Plateau State, Nigeria</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">2005</p>
              <p className="text-[8px] text-slate-400 uppercase tracking-wider">Founded</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">66th</p>
              <p className="text-[8px] text-slate-400 uppercase tracking-wider">In Nigeria</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">24th</p>
              <p className="text-[8px] text-slate-400 uppercase tracking-wider">State-Owned</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-medium italic">
            <Quote size={10} /> Knowledge, Diligence &amp; Integrity
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {greeting}, <span className="gradient-text">{user?.name}</span> <span className="text-2xl">{hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#00843D]" /> {encouragement}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-gradient px-3 sm:px-5 py-2.5 rounded-2xl flex items-center gap-2 sm:gap-3 border-orange-100/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
            <Flame className="text-orange-500 shrink-0" size={22} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Streak</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{profile?.streak || 0}<span className="text-xs font-medium text-slate-400 ml-0.5">days</span></p>
            </div>
          </div>
          <div className="glass-gradient px-3 sm:px-5 py-2.5 rounded-2xl flex items-center gap-2 sm:gap-3 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <Star className="text-[#00843D] shrink-0" size={22} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Level {level}</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{xp}<span className="text-xs font-medium text-slate-400 ml-0.5">XP</span></p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {widgets.map((w) => (
          <div key={w.id} className="group glass-gradient p-4 sm:p-5 md:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col gap-3 min-h-[180px] relative overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00843D]/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn("p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 shadow-sm group-hover:scale-110 transition-transform duration-300", w.color)}>
                  <w.icon size={18} />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200">{w.title}</h3>
              </div>
            </div>
            <div className="flex-1">{w.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
