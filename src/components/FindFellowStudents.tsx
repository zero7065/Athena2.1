/*
 * AcademiaIQ — Find Fellow Students
 *
 * Discover classmates by name, department, city, interest or subject and
 * add them as friends in one tap. Reads the local user directory.
 */
import { useMemo, useState } from 'react';
import { MapPin, UserPlus, Check, Search } from 'lucide-react';
import { loadData, LocalFriend } from '../lib/storage';
import { useAuth } from '../context/AuthContext';

export default function FindFellowStudents() {
  const { user, appData, updateAppData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = useMemo(() => loadData<any[]>('users', []), []);
  const friends = appData.friends;

  const isFriend = (u: any) =>
    friends.some(f => f.studentId === u.studentId || f.name === u.name);

  const addFriend = (u: any) => {
    if (!u || isFriend(u)) return;
    const newFriend: LocalFriend = {
      id: Date.now().toString(),
      name: u.name,
      studentId: u.studentId,
      department: u.department || 'Unknown',
      level: u.level || 1,
      online: true,
    };
    updateAppData(prev => ({ ...prev, friends: [...prev.friends, newFriend] }));
  };

  const students = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allUsers
      .filter((u: any) => u.email !== user?.email)
      .filter((u: any) => u.role !== 'admin')
      .filter((u: any) => {
        if (!q) return true;
        const haystack = [
          u.name, u.email, u.studentId, u.department,
          u.location?.city, u.location?.campus,
          ...(u.interests || []), ...(u.subjects || []),
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(q);
      });
  }, [allUsers, searchQuery, user?.email]);

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 h-full flex flex-col overflow-y-auto">
      <header>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Find Fellow Students</h1>
        <p className="text-sm text-slate-500">Discover classmates who share your interests and subjects.</p>
      </header>

      <div className="glass rounded-3xl p-2">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, department, city, interest or subject…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm min-h-[44px]"
          />
        </div>
      </div>

      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {students.length} classmate{students.length === 1 ? '' : 's'} found
      </div>

      {students.length === 0 ? (
        <div className="glass p-8 sm:p-12 rounded-[32px] text-center flex flex-col items-center justify-center min-h-[200px]">
          <MapPin size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 mb-1">No matches found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">Try a different name, city, interest, or subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {students.map((u: any) => {
            const added = isFriend(u);
            return (
              <div key={u.email || u.studentId || u.name} className="glass p-5 sm:p-6 rounded-[32px] flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00843D] to-emerald-500 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
                    {u.name?.[0] || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white truncate">{u.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{u.department || 'General'} · {u.studentId || '—'}</p>
                    <span className="text-[10px] font-medium text-emerald-500">
                      {u.location?.city || u.location?.campus || 'Campus'}
                    </span>
                  </div>
                </div>

                {(u.interests || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(u.interests || []).slice(0, 3).map((i: string) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{i}</span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => addFriend(u)}
                  disabled={added}
                  className={`mt-auto self-start flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all min-h-[36px] ${
                    added
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 cursor-default'
                      : 'bg-primary text-white hover:bg-emerald-700'
                  }`}
                >
                  {added ? <><Check size={14} /> Friends</> : <><UserPlus size={14} /> Add Friend</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
