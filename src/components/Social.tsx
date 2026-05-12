import React, { useState, useMemo } from 'react';
import { Users, UserPlus, MessageSquare, Search, Zap, Globe, Clock, Check, X, UserMinus, DoorOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { LocalFriend } from '../lib/storage';
import { loadData } from '../lib/storage';

const Social: React.FC = () => {
  const { appData, updateAppData, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'rooms' | 'add'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [addError, setAddError] = useState('');

  const friends = appData.friends;
  const allUsers = useMemo(() => loadData('users', []).filter((u: any) => u.email !== user?.email), [user?.email]);

  const handleAddFriend = () => {
    if (!searchQuery.trim()) return;
    const name = searchQuery.trim();
    if (friends.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      setAddError('Already in your friends list');
      return;
    }
    const matchedUser = allUsers.find((u: any) => u.name.toLowerCase() === name.toLowerCase());
    if (!matchedUser) {
      setAddError('No user found with that name. They must register first.');
      return;
    }
    const newFriend: LocalFriend = {
      id: Date.now().toString(),
      name: matchedUser.name,
      department: matchedUser.department || 'Unknown',
      level: 1,
      online: true,
    };
    updateAppData(prev => ({ ...prev, friends: [...prev.friends, newFriend] }));
    setSearchQuery('');
    setAddError('');
  };

  const handleRemoveFriend = (id: string) => {
    updateAppData(prev => ({ ...prev, friends: prev.friends.filter(f => f.id !== id) }));
    setConfirmRemove(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddFriend();
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Social &amp; Study Rooms</h1>
          <p className="text-sm text-slate-500">Connect with peers and study together.</p>
        </div>
      </header>

      <div className="flex gap-2 p-1 glass rounded-2xl w-fit overflow-x-auto">
        {(['friends', 'rooms', 'add'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px]",
              activeTab === tab ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-100")}>
            {tab === 'friends' ? 'Friends' : tab === 'rooms' ? 'Study Rooms' : 'Add Friend'}
          </button>
        ))}
      </div>

      {activeTab === 'add' && (
        <div className="glass p-4 sm:p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-700">Add a Study Buddy</h3>
          <div className="flex gap-3">
            <input type="text" placeholder="Enter friend's name..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm text-base"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} />
            <button onClick={handleAddFriend}
              className="btn-primary flex items-center justify-center gap-2 px-4 sm:px-6 text-sm whitespace-nowrap min-h-[44px]">
              <UserPlus size={18} /> Add
            </button>
          </div>
          {addError && <p className="text-xs text-red-500 font-bold">{addError}</p>}
          {allUsers.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Registered Users</p>
              <div className="flex flex-wrap gap-2">
                {allUsers.map((u: any, i: number) => (
                  <button key={i} onClick={() => { setSearchQuery(u.name); setAddError(''); }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all">
                    {u.name} <span className="text-slate-400">({u.role})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="space-y-3">
          {friends.length === 0 ? (
            <div className="glass p-8 sm:p-12 rounded-[32px] text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No Friends Yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Switch to "Add Friend" and search for registered users to start collaborating!
              </p>
              <button onClick={() => setActiveTab('add')}
                className="mt-4 btn-primary inline-flex items-center gap-2 text-sm">
                <UserPlus size={16} /> Add Friends
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {friends.map(f => (
                <div key={f.id} className="glass p-4 sm:p-5 rounded-3xl flex items-center gap-3 sm:gap-4 transition-all group">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base sm:text-lg">
                      {f.name[0]}
                    </div>
                    <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white",
                      f.online ? "bg-emerald-500" : "bg-slate-300")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white truncate">{f.name}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">{f.department}</p>
                    <span className="text-[10px] font-medium" style={{ color: f.online ? '#10B981' : '#94A3B8' }}>
                      {f.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary min-w-[36px] min-h-[36px] flex items-center justify-center" title="Message">
                      <MessageSquare size={16} />
                    </button>
                    {confirmRemove === f.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleRemoveFriend(f.id)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
                          <X size={14} />
                        </button>
                        <button onClick={() => setConfirmRemove(null)}
                          className="p-1.5 text-slate-400 rounded-lg hover:bg-slate-100 text-[10px] font-bold min-w-[36px] min-h-[36px] flex items-center justify-center">
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmRemove(f.id)}
                        className="p-2 hover:bg-red-50 rounded-xl transition-colors text-slate-300 hover:text-red-500 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Remove friend">
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="glass p-8 sm:p-12 rounded-[32px] text-center">
          <DoorOpen size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">Study Rooms</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Study rooms let you collaborate in real-time with friends. Invite your study buddies to join a shared session.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {friends.filter(f => f.online).map(f => (
              <div key={f.id} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs font-medium text-primary">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {f.name}
              </div>
            ))}
            {friends.filter(f => f.online).length === 0 && (
              <p className="text-xs text-slate-400 italic">Add friends who are online to start a study room.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;
