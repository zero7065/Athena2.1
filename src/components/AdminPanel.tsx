import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Users, Trophy, Download, TrendingUp, BarChart3,
  PieChart as PieChartIcon, Trash2, FileText, CheckCircle2,
  AlertTriangle, Activity, Mail, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { loadData, getAuditLog, verifyAuditLog, getFeedbackStats } from '../lib/storage';

const AdminPanel: React.FC = () => {
  const { appData, managementRequests, approveManagementRequest, rejectManagementRequest, addManagementRequest } = useAuth();
  const { user, tasks, sessions, friends, gameScores, achievements } = appData;
  const allUsers = useMemo(() => loadData('users', []), []);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'management'>('overview');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [newMgmtEmail, setNewMgmtEmail] = useState('');

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
  const totalRegisteredUsers = allUsers.length;

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
    link.download = `unipulse_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const gamesBreakdown = [
    { name: 'Chess', value: gameScores.chess || 0, color: COLORS[0] },
    { name: 'Memory', value: gameScores.memory || 0, color: COLORS[2] },
    { name: 'Sudoku', value: gameScores.sudoku || 0, color: COLORS[3] },
    { name: 'Art', value: gameScores.artGuesser || 0, color: COLORS[4] },
  ];

  const chartData = [
    { name: 'To Do', value: tasksByStatus['To Do'] },
    { name: 'In Progress', value: tasksByStatus['In Progress'] },
    { name: 'Done', value: tasksByStatus['Done'] },
  ];

  const auditLog = useMemo(() => getAuditLog(), []);
  const auditVerification = useMemo(() => verifyAuditLog(), [auditLog]);
  const feedbackStats = useMemo(() => getFeedbackStats(), []);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3, count: tasks.length },
    { id: 'users' as const, label: 'Users', icon: Users, count: totalRegisteredUsers },
    { id: 'reports' as const, label: 'Reports', icon: FileText, count: auditLog.length },
    { id: 'management' as const, label: 'Management', icon: ShieldCheck, count: managementRequests.length },
  ];

  const handleDeleteUser = (email: string) => {
    if (!window.confirm(`Delete user ${email}?`)) return;
    const users = loadData('users', []);
    const filtered = users.filter((u: any) => u.email !== email);
    localStorage.setItem('unipulse_users', JSON.stringify(filtered));
  };

  const handleAddMgmtRequest = () => {
    if (!newMgmtEmail.trim()) return;
    addManagementRequest(newMgmtEmail.trim());
    setNewMgmtEmail('');
  };

  const header = (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">University Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500">Administrative control panel</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 text-xs">
          <input type="date"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-base"
            value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} />
          <input type="date"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-base"
            value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} />
        </div>
        <button onClick={handleExport}
          className="btn-primary flex items-center justify-center gap-2 text-sm whitespace-nowrap min-h-[44px]">
          <Download size={18} /> Export CSV
        </button>
      </div>
    </header>
  );

  const overviewContent = (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[
          { label: 'Registered Users', value: totalRegisteredUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total XP', value: totalXp, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'My Tasks', value: tasks.length, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Games Played', value: gamesPlayed, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="glass-strong p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-4 border border-white/20 dark:border-white/5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", s.bg, s.color)}>
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
        <div className="glass-strong p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px] flex flex-col gap-4 border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
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

        <div className="glass-strong p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px] flex flex-col gap-4 border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
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
        <div className="glass-strong p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users size={20} className="text-slate-500" />
            <h3 className="font-bold text-sm sm:text-base">All Registered Users ({totalRegisteredUsers})</h3>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm">
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
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0 text-slate-500">{u.name?.[0] || '?'}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.role} &bull; {u.department || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">{u.email}</span>
                  <button onClick={() => handleDeleteUser(u.email)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete user">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* XP Leaderboard */}
      <div className="glass-strong p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
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
      <div className="glass-strong p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[40px] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 size={20} className="text-slate-500" />
          <h3 className="font-bold text-sm sm:text-base">Game Play Counts</h3>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[400px] px-4 sm:px-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gamesBreakdown.map((g, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm text-center">
                <p className="text-lg sm:text-xl font-bold" style={{ color: g.color }}>{g.value}</p>
                <p className="text-[10px] font-medium text-slate-400">{g.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const usersContent = (
    <div className="space-y-4">
      <div className="glass-strong p-5 sm:p-6 rounded-[24px] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">User Management ({totalRegisteredUsers})</h3>
          <p className="text-[10px] text-slate-400">View, edit, and remove platform users.</p>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[600px] px-4 sm:px-0 space-y-2">
            {allUsers.map((u: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0 text-slate-500">{u.name?.[0] || '?'}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{u.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        u.role === 'admin' ? 'bg-red-100 text-red-600' :
                        u.role === 'lecturer' ? 'bg-blue-100 text-blue-600' :
                        u.role === 'management' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600')}>
                        {u.role}
                      </span>
                      {u.department && <span>&bull; {u.department}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[10px] font-bold text-slate-400">
                  <span>{u.email}</span>
                  <button onClick={() => handleDeleteUser(u.email)}
                    className="ml-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete user">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {allUsers.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No users registered yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const reportsContent = (
    <div className="space-y-4">
      <div className="glass-strong p-5 sm:p-6 rounded-[24px] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">System Reports</h3>
          <p className="text-[10px] text-slate-400">Audit logs, feedback analytics, and system health.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={20} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-indigo-600">Audit Log</span>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{auditLog.length}</p>
            <p className="text-[10px] text-slate-400">{auditVerification.valid ? 'Log integrity verified' : auditVerification.tampered.length + ' tampered entries'}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={20} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600">Feedback</span>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{feedbackStats.total}</p>
            <p className="text-[10px] text-slate-400">{feedbackStats.avg > 0 ? feedbackStats.avg + ' avg rating' : 'No ratings yet'}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={20} className="text-purple-500" />
              <span className="text-[10px] font-bold text-purple-600">Security</span>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{auditVerification.valid ? 'OK' : 'ISSUES'}</p>
            <p className="text-[10px] text-slate-400">Audit trail integrity</p>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Audit Activity</h4>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {auditLog.slice(0, 10).map(entry => (
              <div key={entry.id} className="flex items-start justify-between p-2.5 rounded-xl border border-white/10 dark:border-white/5 bg-white/40 dark:bg-slate-800/30 backdrop-blur-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{entry.action}</p>
                  <p className="text-[10px] text-slate-500">{entry.userName} &bull; {new Date(entry.timestamp).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{entry.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{entry.checksum ? '✓' : '✗'}</span>
              </div>
            ))}
            {auditLog.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <AlertTriangle size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No audit activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const managementContent = (
    <div className="space-y-4">
      <div className="glass-strong p-5 sm:p-6 rounded-[24px] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">Management Requests</h3>
          <p className="text-[10px] text-slate-400">Approve or reject requests for management accounts.</p>
        </div>
        <div className="flex gap-3 mb-4">
          <input type="email" placeholder="Enter email to request management access"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-sm"
            value={newMgmtEmail} onChange={e => setNewMgmtEmail(e.target.value)} />
          <button onClick={handleAddMgmtRequest}
            className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-emerald-700 transition-all min-h-[44px]">
            Request
          </button>
        </div>
        <div className="space-y-2">
          {managementRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No management requests yet.</p>
            </div>
          ) : (
            managementRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">{req.email?.[0] || '?'}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{req.email}</p>
                    <p className="text-[10px] text-slate-400">Requested {new Date(req.requestedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold",
                    req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>
                    {req.status}
                  </span>
                  {req.status === 'pending' && (
                    <>
                      <button onClick={() => approveManagementRequest(req.id)}
                        className="px-2 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded transition-colors">Approve</button>
                      <button onClick={() => rejectManagementRequest(req.id)}
                        className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded transition-colors">Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      {header}

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 glass rounded-2xl w-fit overflow-x-auto border border-white/20 dark:border-white/5">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px]",
              activeTab === tab.id ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-white/10 dark:hover:bg-slate-800/50")}>
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-white/30 text-slate-400")}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && overviewContent}
      {activeTab === 'users' && usersContent}
      {activeTab === 'reports' && reportsContent}
      {activeTab === 'management' && managementContent}
    </div>
  );
};

export default AdminPanel;
