import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, DoorOpen, Users, MessageSquare, LogIn, Copy, Check, X, Send, Megaphone, BookOpen, Hash, ArrowLeft, Clock, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { getRooms, saveRoom, getRoomByCode, generateRoomCode, getUserRooms, StudyRoom, RoomMember, Announcement } from '../lib/storage';

interface StudyRoomsProps {
  onBack?: () => void;
}

const StudyRooms: React.FC<StudyRoomsProps> = ({ onBack }) => {
  const { user, appData } = useAuth();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');

  const [newRoom, setNewRoom] = useState({
    name: '',
    subject: '',
    description: '',
  });

  useEffect(() => {
    setRooms(getUserRooms(user?.email || ''));
  }, [user?.email]);

  const refreshRooms = useCallback(() => {
    setRooms(getUserRooms(user?.email || ''));
    if (activeRoom) {
      const updated = getRooms().find(r => r.id === activeRoom.id);
      if (updated) setActiveRoom(updated);
    }
  }, [user?.email, activeRoom]);

  useEffect(() => {
    const interval = setInterval(refreshRooms, 3000);
    return () => clearInterval(interval);
  }, [refreshRooms]);

  const isLecturer = user?.role === 'lecturer';
  const isRoomLecturer = (room: StudyRoom) => room.createdByEmail === user?.email;

  const handleCreateRoom = () => {
    if (!newRoom.name.trim() || !newRoom.subject.trim()) return;
    const code = generateRoomCode();
    const member: RoomMember = {
      name: user?.name || '',
      email: user?.email || '',
      studentId: user?.studentId || '',
      role: 'lecturer',
      joinedAt: Date.now(),
    };
    const room: StudyRoom = {
      id: Date.now().toString(),
      name: newRoom.name.trim(),
      subject: newRoom.subject.trim(),
      code,
      createdBy: user?.name || '',
      createdByEmail: user?.email || '',
      createdAt: Date.now(),
      description: newRoom.description.trim(),
      members: [member],
      announcements: [],
    };
    saveRoom(room);
    setRooms(getUserRooms(user?.email || ''));
    setShowCreate(false);
    setNewRoom({ name: '', subject: '', description: '' });
    setActiveRoom(room);
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    setJoinError('');
    const room = getRoomByCode(joinCode.trim().toUpperCase());
    if (!room) {
      setJoinError('Invalid room code. Check with your lecturer.');
      return;
    }
    if (room.members.some(m => m.email === user?.email)) {
      setJoinError('You are already in this room.');
      return;
    }
    const member: RoomMember = {
      name: user?.name || '',
      email: user?.email || '',
      studentId: user?.studentId || '',
      role: user?.role || 'student',
      joinedAt: Date.now(),
    };
    room.members.push(member);
    saveRoom(room);
    setRooms(getUserRooms(user?.email || ''));
    setShowJoin(false);
    setJoinCode('');
    setActiveRoom(room);
  };

  const handleLeaveRoom = (roomId: string) => {
    const room = getRooms().find(r => r.id === roomId);
    if (!room) return;
    room.members = room.members.filter(m => m.email !== user?.email);
    saveRoom(room);
    setRooms(getUserRooms(user?.email || ''));
    if (activeRoom?.id === roomId) setActiveRoom(null);
  };

  const handlePostAnnouncement = () => {
    if (!announceTitle.trim() || !announceContent.trim() || !activeRoom) return;
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: announceTitle.trim(),
      content: announceContent.trim(),
      author: user?.name || '',
      authorEmail: user?.email || '',
      createdAt: Date.now(),
    };
    const room = getRooms().find(r => r.id === activeRoom.id);
    if (!room) return;
    room.announcements.unshift(announcement);
    saveRoom(room);
    setActiveRoom(room);
    setShowAnnounce(false);
    setAnnounceTitle('');
    setAnnounceContent('');
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (activeRoom) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setActiveRoom(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">{activeRoom.name}</h3>
            <p className="text-[10px] text-slate-400">{activeRoom.subject} &bull; {activeRoom.members.length} members</p>
          </div>
        </div>

        {isRoomLecturer(activeRoom) && (
          <button onClick={() => setShowAnnounce(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all mb-3 w-fit min-h-[44px]">
            <Megaphone size={16} /> Post Announcement
          </button>
        )}

        <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <Hash size={16} className="text-primary shrink-0" />
          <span className="text-xs font-bold text-primary font-mono tracking-wider">{activeRoom.code}</span>
          <button onClick={() => copyRoomCode(activeRoom.code)}
            className="p-1 hover:bg-primary/10 rounded-lg transition-colors">
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400" />}
          </button>
          <span className="text-[10px] text-slate-400 ml-auto">Share code for students to join</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {activeRoom.announcements.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Megaphone size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">No announcements yet.</p>
            </div>
          ) : (
            activeRoom.announcements.map(a => (
              <div key={a.id} className="glass p-4 rounded-2xl">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-xs text-primary">{a.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{a.content}</p>
                <p className="text-[10px] text-slate-400 mt-2">&mdash; {a.author}</p>
              </div>
            ))
          )}

          <div className="glass p-4 rounded-2xl">
            <h4 className="font-bold text-xs text-slate-500 mb-3 flex items-center gap-2">
              <Users size={14} /> Members ({activeRoom.members.length})
            </h4>
            <div className="space-y-2">
              {activeRoom.members.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold",
                      m.role === 'lecturer' ? 'bg-primary' : 'bg-slate-400')}>
                      {m.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.name}</p>
                      <p className="text-[10px] text-slate-400">{m.role === 'lecturer' ? 'Lecturer' : m.studentId}</p>
                    </div>
                  </div>
                  {m.role === 'lecturer' && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Lecturer</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {showAnnounce && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md sm:m-4"
              onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-5 text-slate-800 dark:text-white">Post Announcement</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Announcement Title"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                  value={announceTitle} onChange={e => setAnnounceTitle(e.target.value)} />
                <textarea placeholder="Announcement Content..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary h-24 resize-none text-base"
                  value={announceContent} onChange={e => setAnnounceContent(e.target.value)} />
                <div className="flex gap-3">
                  <button onClick={() => { setShowAnnounce(false); setAnnounceTitle(''); setAnnounceContent(''); }}
                    className="flex-1 py-3 font-bold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button onClick={handlePostAnnouncement}
                    className="flex-1 py-3 font-bold text-sm bg-primary text-white rounded-xl hover:bg-emerald-700 transition-all">Post</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white">My Study Rooms ({rooms.length})</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowJoin(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all min-h-[44px]">
            <LogIn size={16} /> Join
          </button>
          {isLecturer && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all min-h-[44px]">
              <Plus size={16} /> Create Room
            </button>
          )}
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="glass p-8 rounded-[32px] text-center">
          <DoorOpen size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No study rooms yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {isLecturer
              ? 'Create a study room for your students. Share the room code so they can join and collaborate.'
              : 'Ask your lecturer for a room code and join a study room to collaborate with classmates.'}
          </p>
          {isLecturer && (
            <button onClick={() => setShowCreate(true)}
              className="mt-4 btn-primary inline-flex items-center gap-2 text-sm">
              <Plus size={16} /> Create Room
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rooms.map(room => (
            <div key={room.id}
              onClick={() => setActiveRoom(room)}
              className="glass p-4 sm:p-5 rounded-3xl hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{room.name}</h4>
                    <p className="text-[10px] text-slate-400">{room.subject}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{room.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Users size={14} />
                  <span>{room.members.length}</span>
                  <span className="text-slate-300 mx-1">|</span>
                  <Megaphone size={14} />
                  <span>{room.announcements.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-bold text-primary">{room.code}</span>
                  <button onClick={e => { e.stopPropagation(); copyRoomCode(room.code); }}
                    className="p-1 hover:bg-primary/10 rounded-lg transition-colors">
                    <Copy size={12} className="text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {room.members.slice(0, 5).map((m, i) => (
                  <div key={i} className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold",
                    m.role === 'lecturer' ? 'bg-primary' : 'bg-slate-400')}
                    title={m.name}>
                    {m.name[0]}
                  </div>
                ))}
                {room.members.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">
                    +{room.members.length - 5}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md sm:m-4"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-5 text-slate-800 dark:text-white">Create Study Room</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Room Name (e.g. CSC 201 Study Group)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} />
              <input type="text" placeholder="Subject (e.g. Computer Science)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                value={newRoom.subject} onChange={e => setNewRoom({ ...newRoom, subject: e.target.value })} />
              <textarea placeholder="Description (optional)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary h-20 resize-none text-base"
                value={newRoom.description} onChange={e => setNewRoom({ ...newRoom, description: e.target.value })} />
              <div className="flex gap-3">
                <button onClick={() => { setShowCreate(false); setNewRoom({ name: '', subject: '', description: '' }); }}
                  className="flex-1 py-3 font-bold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleCreateRoom}
                  className="flex-1 py-3 font-bold text-sm bg-primary text-white rounded-xl hover:bg-emerald-700 transition-all">Create Room</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJoin && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md sm:m-4"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2 text-slate-800 dark:text-white">Join Study Room</h2>
            <p className="text-xs text-slate-500 mb-5">Enter the 6-character room code provided by your lecturer.</p>
            <div className="space-y-4">
              <input type="text" placeholder="Enter Room Code (e.g. ABC123)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base uppercase tracking-widest font-mono font-bold text-center"
                value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoinRoom()} maxLength={6} autoFocus />
              {joinError && <p className="text-xs text-red-500 font-bold">{joinError}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setShowJoin(false); setJoinCode(''); setJoinError(''); }}
                  className="flex-1 py-3 font-bold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleJoinRoom}
                  className="flex-1 py-3 font-bold text-sm bg-primary text-white rounded-xl hover:bg-emerald-700 transition-all">Join Room</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyRooms;
