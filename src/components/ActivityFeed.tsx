import React, { useState, useEffect } from 'react';
import { Clock, CheckSquare, Timer, Trophy, Gamepad2, Brain, BookOpen, Users, CheckCircle2, Sparkles, Star, MessageSquare, Award, Activity } from 'lucide-react';
import { getActivities, ActivityEntry, logActivity } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const iconMap: Record<string, React.ElementType> = {
  CheckSquare: CheckSquare, Timer: Timer, Trophy: Trophy, Gamepad2: Gamepad2,
  Brain: Brain, BookOpen: BookOpen, Users: Users, CheckCircle2: CheckCircle2,
  Sparkles: Sparkles, Star: Star, MessageSquare: MessageSquare, Award: Award,
};

const activityColors: Record<string, string> = {
  'submitted assignment': 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  'completed study session': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  'posted new assignment': 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  'earned achievement': 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  'won chess game': 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  'completed CBT exam': 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  'joined study room': 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  'graded submissions': 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface ActivityFeedProps {
  limit?: number;
  compact?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ limit = 10, compact = false }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  useEffect(() => {
    const all = getActivities();
    setActivities(filter === 'mine' && user ? all.filter(a => a.userEmail === user.email) : all);
  }, [filter, user]);

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <Activity size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="text-xs text-slate-400 font-medium">No activity yet</p>
        <p className="text-[10px] text-slate-400">Complete tasks to see activity here</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {!compact && (
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setFilter('all')}
            className={cn("text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all", filter === 'all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500')}>All</button>
          <button onClick={() => setFilter('mine')}
            className={cn("text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all", filter === 'mine' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500')}>Mine</button>
        </div>
      )}
      <div className={cn("space-y-1.5", compact && "max-h-[280px] overflow-y-auto custom-scrollbar pr-1")}>
        {activities.slice(0, limit).map(a => {
          const Icon = iconMap[a.icon] || Sparkles;
          const colors = activityColors[a.action] || 'text-slate-500 bg-slate-50 dark:bg-slate-800/50';
          return (
            <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/30 transition-all">
              <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", colors.split(' ').slice(1).join(' '))}>
                <Icon size={14} className={colors.split(' ')[0]} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{a.userName}</span>
                  {' '}{a.action}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{a.details}</p>
              </div>
              <span className="text-[9px] text-slate-400 shrink-0 font-medium mt-0.5">{timeAgo(a.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { logActivity };
export default ActivityFeed;
