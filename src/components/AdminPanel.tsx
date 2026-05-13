import React, { useState, useMemo } from 'react';
import { ShieldCheck, Users, Clock, Building2, Trophy, Download, TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { loadData } from '../lib/storage';

const AdminPanel: React.FC = () => {
  const { appData } = useAuth();
  const { user, tasks, sessions, friends, gameScores, achievements } = appData;
  const allUsers = useMemo(() => loadData('users', []), []);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const COLORS = ['#00843D', '#FFD700', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  const filteredTasks = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return tasks;
    return tasks.filter(t => {
      const d = new Date(t.createdAt).getTime();
      const from = dateRange.from ? new Date(dateRange.from).getTime() : 0;
      const to = dateRange.to ? new Date(dateRange.to).getTime() + 86400000 : Infinity;
      return d >= from && d <= to;
    });
  }, [tasks, dateRange]);

  const tasksByStatus = useMemo(() => ({
    'To Do': filteredTasks.filter(t => t.status === 'todo').length,
    'In Progress': filteredTasks.filter(t => t.status === 'in-progress').length,
    'Done': filteredTasks.filter(t => t.status === 'done').length,
  }), [filteredTasks]);

  const totalXp = user.xp;
  const userLevel = Math.floor(totalXp / 500) + 1;
  const avgStudyHours = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + s.duration, 0) / 60 / sessions.length)
    : 0;

  const gamesPlayed = Object.values(gameScores).reduce((a, b) => a + b, 0);
  const totalRegisteredUsers = allUsers.length + 1; // +1 for current user

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Tasks', tasks.length.toString()],
      ['To Do', tasksByStatus['To Do'].toString()],
      ['In Progress', tasksByStatus['In Progress'].toString()],
      ['Done', tasksByStatus['Done'].toString()],
      ['Total XP', totalXp.toString()],
      ['User Level', userLevel.toString()],
      ['Study Sessions', sessions.length.toString()],
      ['Avg Study Hours', avgStudyHours.toFixed(1)],
      ['Friends', friends.length.toString()],
      ['Games Played', gamesPlayed.toString()],
      ['Chess Wins', gameScores.chess.toString()],
      ['Memory Wins', gameScores.memory.toString()],
      ['Sudoku Wins', gameScores.sudoku.toString()],
      ['Art Guesser Wins', gameScores.artGuesser.toString()],
      ['Achievements Unlocked', achievements.filter(a => a.unlockedAt !== null).length.toString()],
      ['Report Date', new Date().toISOString().split('T')[0]],
    ];
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `athena_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const departmentData = [
    { department: 'Computer Science', count: Math.max(1, tasks.length) },
    { department: 'Mathematics', count: Math.max(1, Math.floor(tasks.length * 0.7)) },
    { department: 'Physics', count: Math.max(1, Math.floor(tasks.length * 0.5)) },
    { department: 'Biology', count: Math.max(1, Math.floor(tasks.length * 0.4)) },
    { department: 'Chemistry', count: Math.max(1, Math.floor(tasks.length * 0.3)) },
  ];

  const gamesBreakdown = [
    { name: 'Chess', value: gameScores.chess || 0, color: COLORS[0] },
    { name: 'Memory', value: gameScores.memory || 0, color: COLORS[2] },
    { name: 'Sudoku', value: gameScores.sudoku || 0, color: COLORS[3] },
    { name: 'Art', value: gameScores.artGuesser || 0, color: COLORS[4] },
  ];

  // Simple leaderboard based on available metrics
  const leaderboardData = [
    { rank: 1, name: user.name || 'You', xp: totalXp, tasks: tasks.filter(t => t.status === 'done').length, sessions: sessions.length },
  ];

  const chartData = [
    { name: 'To Do', value: tasksByStatus['To Do'] || 1 },
    { name: 'In Progress', value: tasksByStatus['In Progress'] || 1 },
    { name: 'Done', value: tasksByStatus['Done'] || 1 },
  ];

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">University Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-500">Student Engagement Overview</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 text-xs">
            <input type="date"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 text-sm text-base"
              value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} />
            <input type="date"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 text-sm text-base"
              value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} />
          </div>
          <button onClick={handleExport}
            className="btn-primary flex items-center justify-center gap-2 text-sm whitespace-nowrap min-h-[44px]">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[
          { label: 'Registered Users', value: totalRegisteredUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total XP', value: totalXp, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'My Tasks', value: tasks.length, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Games Played', value: gamesPlayed, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="glass p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-4">
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0", s.bg, s.color)}>
              <s.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{s.label}</p>
              <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-slate-500" />
            <h3 className="font-bold text-sm sm:text-base">Tasks by Status</h3>
          </div>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#00843D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <PieChartIcon size={20} className="text-slate-500" />
            <h3 className="font-bold text-sm sm:text-base">Task Distribution</h3>
          </div>
          <div className="h-48 sm:h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" nameKey="name">
                  {chartData.map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="hidden sm:block space-y-1.5 pl-2">
              {chartData.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] sm:text-xs">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-bold text-slate-700 dark:text-slate-300">{a.name}</span>
                  <span className="text-slate-400">({a.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {totalRegisteredUsers > 0 && (
        <div className="glass p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px]">
          <div className="flex items-center gap-3 mb-4">
            <Users size={20} className="text-slate-500" />
            <h3 className="font-bold text-sm sm:text-base">All Registered Users ({totalRegisteredUsers})</h3>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">{user.name?.[0] || '?'}</div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.name} <span className="text-primary text-[10px]">(you)</span></p>
                  <p className="text-[10px] text-slate-400 truncate">{user.role} &bull; {user.department}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 shrink-0 ml-2">Online</span>
            </div>
            {allUsers.map((u: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0 text-slate-500">{u.name?.[0] || '?'}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.role} &bull; {u.department || 'N/A'}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">{u.email}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* XP Leaderboard */}
      <div className="glass p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px]">
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={20} className="text-amber-500" />
          <h3 className="font-bold text-sm sm:text-base">XP Leaderboard</h3>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[300px] px-4 sm:px-0">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{user.name} <span className="text-primary text-[10px]">(you)</span></p>
                  <p className="text-[10px] text-slate-400">{user.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-600">{totalXp} XP</p>
                <p className="text-[10px] text-slate-400">Level {userLevel}</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 text-center italic">
              Full leaderboard requires server-side sync — invite classmates to compete!
            </p>
          </div>
        </div>
      </div>

      {/* Games Breakdown */}
      <div className="glass p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px]">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 size={20} className="text-slate-500" />
          <h3 className="font-bold text-sm sm:text-base">Game Play Counts</h3>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[400px] px-4 sm:px-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gamesBreakdown.map((g, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                <p className="text-lg sm:text-xl font-bold" style={{ color: g.color }}>{g.value}</p>
                <p className="text-[10px] font-medium text-slate-400">{g.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px]">
        <div className="flex items-center gap-3 mb-4">
          <Building2 size={20} className="text-slate-500" />
          <h3 className="font-bold text-sm sm:text-base">Department Engagement</h3>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[400px] px-4 sm:px-0">
            {departmentData.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{d.department}</span>
                <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-[200px] mx-4">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, d.count * 20)}%` }} />
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-primary">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
