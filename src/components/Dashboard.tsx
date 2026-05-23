import React from 'react';
import { Calendar, CheckSquare, Zap, Users, TrendingUp, Flame, Star, School, MessageSquare, Sparkles, Brain, Trophy, BookOpen } from 'lucide-react';
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Level {level}</span>
            <span className="text-xs font-bold text-primary">{xp} XP</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 text-center">{xpNeeded - progressInLevel} XP to Level {level + 1}</p>
        </div>
      )
    },
    {
      id: 'achievements', title: 'Achievements', icon: Trophy, color: 'text-amber-500',
      content: (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{achievements.filter(a => a.unlockedAt !== null).length}/{achievements.length} unlocked</p>
          <div className="grid grid-cols-4 gap-2">
            {achievements.filter(a => a.unlockedAt !== null).slice(0, 8).map(a => (
              <div key={a.id} className="w-full aspect-square rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 text-lg" title={a.title}>
                {'\u2B50'}
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab?.('achievements')} className="w-full text-center text-[10px] font-bold text-primary hover:underline pt-1">View All</button>
        </div>
      )
    },
    {
      id: 'friend-activity', title: 'Friend Activity', icon: Users, color: 'text-indigo-500',
      content: (
        <div className="space-y-2">
          {appData.friends.filter(f => f.online).slice(0, 3).map(f => (
            <div key={f.id} className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">{f.name[0]}</div>
              <span className="font-medium text-slate-600 dark:text-slate-300">
                <span className="font-bold">{f.name}</span>{' '}
                <span className="text-emerald-500">Online</span>
              </span>
            </div>
          ))}
          {appData.friends.filter(f => f.online).length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-3">Add friends to see their activity.</p>
          )}
        </div>
      )
    },
    {
      id: 'study-progress', title: 'Study Progress', icon: BookOpen, color: 'text-blue-500',
      content: (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Sessions</span>
            <span className="font-bold text-primary">{sessions.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Tasks Completed</span>
            <span className="font-bold text-primary">{tasks.filter(t => t.status === 'done').length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Friends</span>
            <span className="font-bold text-primary">{appData.friends.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Games Played</span>
            <span className="font-bold text-primary">{Object.values(appData.gameScores).reduce((a, b) => a + b, 0)}</span>
          </div>
        </div>
      )
    },
    {
      id: 'plasu-info', title: 'PLASU Bokkos', icon: School, color: 'text-accent',
      content: (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Established 2005 &bull; 66th Nigerian University &bull; Motto: "Knowledge, Diligence &amp; Integrity"
          </p>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
            <span className="text-[10px] font-bold text-primary">Bokkos, Plateau State</span>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {greeting}, <span className="text-primary">{user?.name}</span> <span className="text-2xl">{hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">{encouragement}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass px-3 sm:px-5 py-2 rounded-2xl flex items-center gap-2 sm:gap-3 border-orange-100">
            <Flame className="text-orange-500 shrink-0" size={22} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Streak</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{profile?.streak || 0} Days</p>
            </div>
          </div>
          <div className="glass px-3 sm:px-5 py-2 rounded-2xl flex items-center gap-2 sm:gap-3 border-primary/20">
            <Star className="text-primary shrink-0" size={22} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Level {level}</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{xp} XP</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {widgets.map((w) => (
          <div key={w.id} className="glass p-4 sm:p-5 md:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col gap-3 min-h-[180px] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn("p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800", w.color)}>
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
