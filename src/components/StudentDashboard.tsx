/*
 * CampusIQ — Student Dashboard
 *
 * Personal academic overview: stats, quick actions, today's tasks,
 * recent study activity, and quick access to core tools.
 */

import React, { useMemo } from 'react';
import { LayoutDashboard, CheckSquare, Clock, Sparkles, Users, Trophy, Target, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { calcLevel, xpForNextLevel } from '../lib/storage';
import ActivityFeed from './ActivityFeed';
import { cn } from '../lib/utils';

interface StudentDashboardProps {
  setActiveTab?: (tab: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ setActiveTab }) => {
  const { appData, user } = useAuth();
  const profile = useCurrentUser();
  const tasks = appData.tasks;
  const sessions = appData.sessions;

  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(t => t.status !== 'done').length, [tasks]);
  const avgFocus = sessions.length > 0 ? sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length : 0;
  const xp = profile?.xp ?? 0;
  const level = calcLevel(xp);
  const currentLevelXp = xpForNextLevel(level - 1);
  const nextLevelXp = xpForNextLevel(level);
  const progressInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progressPct = Math.min(100, Math.round((progressInLevel / (xpNeeded || 1)) * 100));

  const quickTools = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-primary', desc: `${pendingTasks} pending` },
    { id: 'study', label: 'Focus Timer', icon: Clock, color: 'text-blue-500', desc: `${sessions.length} sessions` },
    { id: 'ai', label: 'AI Tutor', icon: Sparkles, color: 'text-purple-500', desc: 'Ask anything' },
    { id: 'social', label: 'Friends', icon: Users, color: 'text-rose-500', desc: `${appData.friends.length} friends` },
    { id: 'syllabus', label: 'Syllabus', icon: Target, color: 'text-indigo-500', desc: 'Course plan' },
    { id: 'content', label: 'Content', icon: TrendingUp, color: 'text-amber-500', desc: 'Study resources' },
  ];

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Student Dashboard — {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#00843D]" /> Welcome back — keep pushing toward your goals!
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-gradient px-3 sm:px-5 py-2.5 rounded-2xl flex items-center gap-2 sm:gap-3">
            <Target size={22} className="text-[#00843D]" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Level {level}</p>
              <p className="text-sm font-bold">{xp} XP</p>
            </div>
          </div>
          <div className="glass-gradient px-3 sm:px-5 py-2.5 rounded-2xl flex items-center gap-2 sm:gap-3">
            <Clock size={22} className="text-blue-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Sessions</p>
              <p className="text-sm font-bold">{sessions.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="glass p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Level Progress</p>
          <span className="text-[10px] font-bold text-[#00843D]">{progressInLevel} / {xpNeeded} XP</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Quick tools grid */}
      <div>
        <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
          <LayoutDashboard size={16} /> Quick Access
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {quickTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTab?.(tool.id)}
              className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2 min-h-[140px] hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className={cn("p-3 rounded-xl bg-white/60 dark:bg-slate-800/60", tool.color)}>
                <tool.icon size={24} />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs text-slate-800 dark:text-white">{tool.label}</p>
                <p className="text-[10px] text-slate-400">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div>
        <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
          <Activity size={16} /> Recent Activity
        </h3>
        <ActivityFeed limit={8} compact />
      </div>
    </div>
  );
};

export default StudentDashboard;