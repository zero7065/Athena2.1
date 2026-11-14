import React, { useState, useMemo } from 'react';
import {
  Search, UserPlus, Check, MapPin, Users,
  MessageSquare, X,
} from 'lucide-react';
import { useStudentProfiles, StudentProfile } from '../hooks/useStudentProfiles';
import { cn } from '../lib/utils';
import { LocalFriend } from '../lib/storage';

const FRIENDS_KEY = 'unipulse_friends';

function loadFriends(): LocalFriend[] {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFriends(friends: LocalFriend[]) {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

const StudentProfiles: React.FC = () => {
  const { profiles } = useStudentProfiles();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [friends, setFriends] = useState<LocalFriend[]>(loadFriends);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);

  const departments = ['All', ...Array.from(new Set(profiles.map(p => p.department)))];

  const filtered = useMemo(() => {
    return profiles.filter(p => {
      if (search && !`${p.name} ${p.email} ${p.studentId} ${p.interests.join(' ')} ${p.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (departmentFilter !== 'All' && p.department !== departmentFilter) return false;
      if (yearFilter !== 'All' && p.year !== parseInt(yearFilter)) return false;
      return true;
    });
  }, [profiles, search, departmentFilter, yearFilter]);

  const isFriend = (p: StudentProfile) => friends.some(f => f.studentId === p.studentId);

  const handleAddFriend = (p: StudentProfile) => {
    if (isFriend(p)) {
      const updated = friends.filter(f => f.studentId !== p.studentId);
      setFriends(updated);
      saveFriends(updated);
      return;
    }
    const newFriend: LocalFriend = {
      id: Date.now().toString(),
      name: p.name,
      studentId: p.studentId,
      department: p.department,
      level: p.level,
      online: !!p.isOnline,
    };
    const updated = [...friends, newFriend];
    setFriends(updated);
    saveFriends(updated);
  };

  const departmentsList = departments;

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Student Profiles</h1>
          <p className="text-xs sm:text-sm text-slate-500">Find study partners, make friends, and connect across campus.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <Users size={16} /> {profiles.length} students
        </div>
      </header>

      {/* Filters */}
      <div className="glass p-3 sm:p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, student ID, course, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="input-field px-3 py-2 rounded-xl text-xs">
            <option value="All">All Departments</option>
            {departmentsList.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="input-field px-3 py-2 rounded-xl text-xs">
            <option value="All">All Years</option>
            {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
          {(search || departmentFilter !== 'All' || yearFilter !== 'All') && (
            <button onClick={() => { setSearch(''); setDepartmentFilter('All'); setYearFilter('All'); }} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Profile Grid */}
      {filtered.length === 0 ? (
        <div className="glass p-8 text-center">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No students match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(p => (
            <div key={p.id} className="glass p-4 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  {p.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">{p.name}</h3>
                  <p className="text-[10px] text-slate-500 truncate">{p.department} · Year {p.year}</p>
                  <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {p.location.city}</p>
                </div>
                <a href={`mailto:${p.email}`} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 min-h-[36px] min-w-[36px] flex items-center justify-center">
                  <MessageSquare size={16} />
                </a>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{p.bio}</p>
              <div className="flex flex-wrap gap-1">
                {p.interests.slice(0, 3).map(i => <span key={i} className="badge badge-primary">{i}</span>)}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedProfile(p)} className="flex-1 btn-primary px-3 py-2 text-xs min-h-[44px]">
                  View Details
                </button>
                <button onClick={() => handleAddFriend(p)} className={cn("px-3 py-2 text-xs min-h-[44px] rounded-xl font-bold flex items-center gap-1",
                  isFriend(p) ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}>
                  {isFriend(p) ? <Check size={14} /> : <UserPlus size={14} />}
                  {isFriend(p) ? 'Friend' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedProfile(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <X size={18} />
            </button>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-24 h-24 rounded-[28px] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">{selectedProfile.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedProfile.department} · {selectedProfile.program} · Year {selectedProfile.year}</p>
                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-1"><MapPin size={10} /> {selectedProfile.location.city}, {selectedProfile.location.country}</p>
              </div>
              <div className="flex gap-2 w-full">
                <button onClick={() => handleAddFriend(selectedProfile)} className="flex-1 btn-primary px-4 py-2.5 text-sm min-h-[44px] flex items-center justify-center gap-2">
                  {isFriend(selectedProfile) ? <Check size={16} /> : <UserPlus size={16} />}
                  {isFriend(selectedProfile) ? 'Friend' : 'Add Friend'}
                </button>
                <a href={`mailto:${selectedProfile.email}`} className="flex-1 btn-secondary px-4 py-2.5 text-sm min-h-[44px] flex items-center justify-center gap-2">
                  <MessageSquare size={16} /> Message
                </a>
              </div>
              <div className="w-full text-left space-y-3 mt-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">About</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{selectedProfile.bio}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Interests</p>
                  <div className="flex flex-wrap gap-1.5">{selectedProfile.interests.map(i => <span key={i} className="badge badge-primary">{i}</span>)}</div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1.5">{selectedProfile.skills.map(s => <span key={s} className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{s}</span>)}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-primary">{selectedProfile.level}</p>
                    <p className="text-[8px] text-slate-400 uppercase">Level</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-amber-500">{selectedProfile.stats?.tasksCompleted ?? 0}</p>
                    <p className="text-[8px] text-slate-400 uppercase">Tasks</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-emerald-500">{selectedProfile.stats?.studyHours ?? 0}</p>
                    <p className="text-[8px] text-slate-400 uppercase">Hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfiles;