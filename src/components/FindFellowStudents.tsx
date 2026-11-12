/*
 * UniPulse — Find Fellow Students Page
 *
 * Lets logged-in students discover other students who share location, interests,
 * or subjects. Uses registered users stored locally.
 */
import React, { useState, useMemo } from 'react';
import { MapPin, User } from 'lucide-react';
import { loadData } from '../lib/storage';

interface FindFellowProps {
  activeTab?: 'find-fellow';
}

export default function FindFellowStudents({ activeTab }: FindFellowProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const allUsers = useMemo(() => loadData('users', []), []);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    setShowResults(true);
    if (!query) {
      setResults([]);
      return;
    }
    const matched = allUsers.filter(u => {
      const haystack =
        `${u.name} ${u.email} ${u.studentId} ${u.department || ''} ${u.location?.city || ''} ${u.interests?.join(' ') || ''} ${u.subjects?.join(' ') || ''}`.toLowerCase();
      return haystack.includes(query);
    });
    setResults(matched);
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 h-full flex flex-col overflow-y-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Find Fellow Students</h1>
          <p className="text-sm text-slate-500">Discover classmates nearby who share your interests and subjects.</p>
        </div>
      </header>

      <div className="glass rounded-3xl p-1">
        <div className="flex gap-2 p-1">
          <input
            type="text"
            placeholder="Enter name, city, campus, interest, or subject..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm text-base min-h-[44px]" />
          <button onClick={handleSearch}
            className="btn-primary flex items-center justify-center gap-2 px-4 sm:px-6 min-h-[44px] min-w-[100px]">
            <MapPin size={18} /> Find
          </button>
        </div>
      </div>

      {showResults ? results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {results.map(u => (
            <div key={u.email || u.studentId} className="glass p-5 sm:p-6 rounded-[32px] flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00843D] to-emerald-500 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
                  {u.name?.[0] || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white truncate">{u.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{u.department || 'General'} · {u.studentId || ''}</p>
                  <span className="text-[10px] font-medium text-emerald-500">
                    {u.location?.city ? u.location.city : 'Campus'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {(u.interests || []).slice(0, 3).map((i: string) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{i}</span>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 text-left leading-relaxed">
                Study partner matching — connect via your Student ID from the Friends tab.
              </p>
              <button className="mt-auto self-start px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all min-h-[36px]">
                Connect
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-8 sm:p-12 rounded-[32px] text-center flex flex-col items-center justify-center min-h-[200px]">
          <MapPin size={48} className="mx-auto mb-4 text-slate-400" />
          <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 mb-1">No matches found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">Try a different city, campus, interest, or subject.</p>
        </div>
      ) : (
        <div className="glass p-8 sm:p-12 rounded-[32px] text-center flex flex-col items-center justify-center min-h-[200px]">
          <MapPin size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 mb-1">Find Fellow Students</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">Search by name, city, campus, interest, or study subject.</p>
        </div>
      )}
    </div>
  );
}
