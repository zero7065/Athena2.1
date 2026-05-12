import React, { useMemo } from 'react';
import { BookOpen, Upload, Users, FileText, CheckCircle, Clock, Search, Filter, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { loadData, getDefaultAppData } from '../lib/storage';

const LecturerPortal: React.FC = () => {
  const { user, appData } = useAuth();
  const [activeSubTab, setActiveSubTab] = React.useState<'materials' | 'students' | 'marking'>('materials');

  const allUsers = useMemo(() => loadData('users', []), []);
  const students = useMemo(() => allUsers.filter((u: any) => u.role === 'student'), [allUsers]);
  const totalStudents = students.length;
  const totalMaterials = appData.tasks.filter(t => t.title.startsWith('[MATERIAL]')).length;
  const pendingMarking = Math.max(0, totalStudents - appData.tasks.filter(t => t.status === 'done').length);

  const stats = [
    { label: 'Total Students', value: String(totalStudents || 0), icon: Users, color: 'text-blue-500' },
    { label: 'Materials Shared', value: String(totalMaterials || 0), icon: BookOpen, color: 'text-emerald-500' },
    { label: 'Pending Review', value: String(pendingMarking || 0), icon: Clock, color: 'text-orange-500' },
  ];

  const materialsList = appData.tasks.filter(t => t.title.startsWith('[MATERIAL]'));

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col max-w-6xl mx-auto overflow-y-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Lecturer Portal <span className="text-primary font-medium text-sm sm:text-base block sm:inline mt-1 sm:mt-0">{user?.title} {user?.name}</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm">Manage your curriculum, students, and academic insights.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        {stats.map((s, i) => (
          <div key={i} className="glass p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] flex items-center gap-4 border border-slate-200/50 dark:border-slate-700/50">
            <div className={cn("p-3 rounded-2xl bg-white dark:bg-slate-900 shrink-0 shadow-sm", s.color)}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'materials' as const, label: 'Curriculum', icon: BookOpen },
          { id: 'students' as const, label: 'Engagement', icon: Users },
          { id: 'marking' as const, label: 'Review', icon: CheckCircle },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap min-h-[44px]",
              activeSubTab === tab.id ? "text-primary" : "text-slate-500 hover:text-slate-700")}>
            <tab.icon size={18} />
            {tab.label}
            {activeSubTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeSubTab === 'materials' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search materials..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <button className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Filter size={18} className="text-slate-500" />
              </button>
            </div>

            {materialsList.length === 0 ? (
              <div className="glass p-8 sm:p-12 rounded-[40px] text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No Materials Yet</h3>
                <p className="text-sm text-slate-400">Course materials shared by students will appear here. Go to Tasks to create a material by prefixing the title with "[MATERIAL]".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {materialsList.map(m => (
                  <div key={m.id} className="glass p-4 sm:p-5 rounded-[32px] flex items-start justify-between group hover:border-primary/30 transition-all">
                    <div className="flex gap-3">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                        <FileText size={22} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white group-hover:text-primary transition-colors truncate">{m.title.replace('[MATERIAL] ', '')}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{m.description || 'No description'}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{m.priority}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'students' && (
          <div className="glass p-5 sm:p-6 md:p-8 rounded-[40px]">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white mb-4">Registered Students ({totalStudents})</h3>
            {totalStudents === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No students registered yet.</p>
                <p className="text-xs mt-1">Students appear here once they create accounts.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {students.map((s: any, i: number) => {
                  const studentTasks = appData.tasks.filter(t => t.title.startsWith(s.email));
                  return (
                    <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {s.name?.[0] || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{s.department} &bull; Year {s.year_of_study}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[10px] font-bold text-slate-400">{studentTasks.length} tasks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'marking' && (
          <div className="glass p-5 sm:p-6 md:p-8 rounded-[40px]">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white mb-4">Submissions Review</h3>
            {appData.tasks.filter(t => t.status === 'done').length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No completed tasks to review.</p>
                <p className="text-xs mt-1">When students complete tasks, they'll appear here for your review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appData.tasks.filter(t => t.status === 'done').slice(0, 20).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{t.title}</p>
                        <p className="text-[10px] text-slate-400">{t.dueDate}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 shrink-0 ml-2">Completed</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerPortal;
