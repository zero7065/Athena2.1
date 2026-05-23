import React, { useState, useMemo, useEffect } from 'react';
import { Users, UserPlus, MessageSquare, Check, X, UserMinus, Copy, Send, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { LocalFriend, loadData } from '../lib/storage';
import { sendMessage, getConversation, markMessagesRead, DirectMessage, getUnreadCountFrom } from '../lib/storage';
import StudyRooms from './StudyRooms';

const Social: React.FC = () => {
  const { appData, updateAppData, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'rooms' | 'add'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [addError, setAddError] = useState('');
  const [chatFriend, setChatFriend] = useState<LocalFriend | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const friends = appData.friends;
  const allUsers = useMemo(() => loadData('users', []).filter((u: any) => u.email !== user?.email), [user?.email]);

  useEffect(() => {
    const counts: Record<string, number> = {};
    friends.forEach(f => {
      if (f.studentId) {
        const matchedUser = allUsers.find((u: any) => u.studentId === f.studentId);
        if (matchedUser) {
          counts[f.id] = getUnreadCountFrom(user?.email || '', matchedUser.email);
        }
      }
    });
    setUnreadCounts(counts);
  }, [friends, allUsers, user?.email]);

  useEffect(() => {
    if (chatFriend) {
      const matchedUser = allUsers.find((u: any) => u.studentId === chatFriend.studentId);
      if (matchedUser) {
        const conv = getConversation(user?.email || '', matchedUser.email);
        setMessages(conv);
        markMessagesRead(user?.email || '', matchedUser.email);
      }
    }
  }, [chatFriend, allUsers, user?.email]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (chatFriend) {
        const matchedUser = allUsers.find((u: any) => u.studentId === chatFriend.studentId);
        if (matchedUser) {
          const conv = getConversation(user?.email || '', matchedUser.email);
          setMessages(conv);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [chatFriend, allUsers, user?.email]);

  const handleAddFriend = () => {
    if (!searchQuery.trim()) return;
    const studentId = searchQuery.trim();
    if (friends.some(f => f.studentId?.toLowerCase() === studentId.toLowerCase())) {
      setAddError('Already in your friends list');
      return;
    }
    const matchedUser = allUsers.find((u: any) => u.studentId?.toLowerCase() === studentId.toLowerCase());
    if (!matchedUser) {
      setAddError('No user found with that Student ID. They must register first.');
      return;
    }
    const newFriend: LocalFriend = {
      id: Date.now().toString(),
      name: matchedUser.name,
      studentId: matchedUser.studentId,
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

  const [copied, setCopied] = useState(false);

  const copyStudentId = () => {
    if (user?.studentId) {
      navigator.clipboard.writeText(user.studentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !chatFriend || !user) return;
    const matchedUser = allUsers.find((u: any) => u.studentId === chatFriend.studentId);
    if (!matchedUser) return;
    const msg: DirectMessage = {
      id: Date.now().toString(),
      from: user.name || '',
      fromEmail: user.email || '',
      to: chatFriend.name,
      toEmail: matchedUser.email,
      text: chatMessage.trim(),
      timestamp: Date.now(),
      read: false,
    };
    sendMessage(msg);
    setMessages(prev => [...prev, msg]);
    setChatMessage('');
  };

  const findFriendEmail = (friend: LocalFriend): string | undefined => {
    const matched = allUsers.find((u: any) => u.studentId === friend.studentId);
    return matched?.email;
  };

  if (chatFriend) {
    const friendEmail = findFriendEmail(chatFriend);
    return (
      <div className="p-3 sm:p-5 md:p-8 space-y-4 h-full flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => setChatFriend(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">{chatFriend.name}</h3>
            <p className="text-[10px] text-slate-400">{chatFriend.department}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 p-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">No messages yet. Say hello!</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex", msg.fromEmail === user?.email ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] p-3 rounded-2xl text-xs",
                msg.fromEmail === user?.email
                  ? "bg-primary text-white rounded-br-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md"
              )}>
                <p>{msg.text}</p>
                <p className={cn("text-[10px] mt-1",
                  msg.fromEmail === user?.email ? "text-white/60" : "text-slate-400"
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <input type="text" placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm text-base"
            value={chatMessage} onChange={e => setChatMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
          <button onClick={handleSendMessage}
            className="p-3 bg-primary text-white rounded-xl hover:bg-emerald-700 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Send size={18} />
          </button>
        </div>
      </div>
    );
  }

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
            <input type="text" placeholder="Enter Student ID..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm text-base"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} />
            <button onClick={handleAddFriend}
              className="btn-primary flex items-center justify-center gap-2 px-4 sm:px-6 text-sm whitespace-nowrap min-h-[44px]">
              <UserPlus size={18} /> Add
            </button>
          </div>
          {addError && <p className="text-xs text-red-500 font-bold">{addError}</p>}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Your Student ID</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-primary">{user?.studentId || 'N/A'}</span>
              <button onClick={copyStudentId} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Copy Student ID">
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Share this ID with classmates so they can add you!</p>
          </div>
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="space-y-3">
          {friends.length === 0 ? (
            <div className="glass p-8 sm:p-12 rounded-[32px] text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No study buddies yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Share your Student ID to connect. Add friends by their Student ID to start collaborating!
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
                    <button onClick={() => setChatFriend(f)}
                      className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary min-w-[36px] min-h-[36px] flex items-center justify-center" title="Message">
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

      {activeTab === 'rooms' && <StudyRooms />}
    </div>
  );
};

export default Social;
