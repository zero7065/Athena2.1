import React, { useMemo } from 'react';
import { Trophy, Star, Zap, Target, Flame, CheckCircle2, Lock, Award, GraduationCap, Gamepad2, Timer, Clock, Brain, Grid3X3, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calcLevel, xpForNextLevel, LocalAchievement } from '../lib/storage';
import { cn } from '../lib/utils';

const iconMap: Record<string, React.ElementType> = {
  CheckSquare, Target, Zap, Timer, Clock, Flame, Star, Trophy, Brain, Grid3X3, Award, GraduationCap, Gamepad2,
};

const Achievements: React.FC = () => {
  const { appData } = useAuth();
  const { user, achievements } = appData;

  const level = calcLevel(user.xp);
  const currentLevelXp = xpForNextLevel(level - 1);
  const nextLevelXp = xpForNextLevel(level);
  const progressInLevel = user.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progressPct = Math.min(100, Math.round((progressInLevel / (xpNeeded || 1)) * 100));

  const unlocked = useMemo(() => achievements.filter(a => a.unlockedAt !== null), [achievements]);
  const locked = useMemo(() => achievements.filter(a => a.unlockedAt === null), [achievements]);

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      <header>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Achievements</h1>
        <p className="text-sm text-slate-500">Track your progress and unlock legendary badges.</p>
      </header>

      <div className="glass p-5 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px] bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/10">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <Trophy size={36} />
          </div>
          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Level {level}</h3>
                <p className="text-xs sm:text-sm text-slate-500">{user.xp} XP total</p>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="px-3 sm:px-4 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Unlocked</span>
                  <span className="text-base sm:text-lg font-bold text-primary">{unlocked.length}/{achievements.length}</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 sm:h-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}>
                <div className="h-full w-full bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1 text-center sm:text-left">
              {xpNeeded - progressInLevel} XP to Level {level + 1}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" /> Unlocked ({unlocked.length})
        </h2>
        {unlocked.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-6">Complete tasks, study sessions, and games to unlock achievements.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {unlocked.map(a => {
              const Icon = iconMap[a.icon] || Trophy;
              return (
                <div key={a.id} className="glass p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] flex items-center gap-4 transition-all shadow-md">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <Icon size={28} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white truncate">{a.title}</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">{a.description}</p>
                    <div className="mt-1 inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded-full">
                      {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : 'Unlocked'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-500 flex items-center gap-2">
          <Lock size={16} /> Locked ({locked.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {locked.map(a => {
            const Icon = iconMap[a.icon] || Trophy;
            return (
              <div key={a.id} className="glass p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] flex items-center gap-4 opacity-60 grayscale transition-all">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 shrink-0">
                  <Icon size={28} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-slate-600 dark:text-slate-400 truncate">{a.title}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 truncate">{a.requirement}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
