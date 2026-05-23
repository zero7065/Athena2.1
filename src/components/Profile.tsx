import React, { useState } from 'react';
import { UserCircle, Edit3, Palette, Save, Brain, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { cn } from '../lib/utils';
import { calcLevel } from '../lib/storage';

const Profile: React.FC = () => {
  const { user, updateAppData, logout } = useAuth();
  const profile = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: profile?.name || user?.name || '',
    department: profile?.department || user?.department || '',
    yearOfStudy: profile?.yearOfStudy || 1,
    bio: profile?.bio || '',
    themeColor: profile?.themeColor || '#00843D',
    aiPersonality: (profile?.aiPersonality || 'charming') as 'charming' | 'strict' | 'sarcastic' | 'zen',
    fontPreference: (profile?.fontPreference || 'sans') as 'sans' | 'mono' | 'serif',
    isAnonymous: profile?.isAnonymous || false,
    avatar_url: profile?.avatar_url || '',
  });

  const personalities = [
    { id: 'charming', label: 'Charming', desc: 'Supportive & sweet' },
    { id: 'strict', label: 'Strict', desc: 'No-nonsense mentor' },
    { id: 'sarcastic', label: 'Sarcastic', desc: 'Dry humor & wit' },
    { id: 'zen', label: 'Zen', desc: 'Calm & peaceful' }
  ];

  const themeColors = ['#00843D', '#FFD700', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];

  const handleSave = () => {
    updateAppData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        name: formData.name,
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        themeColor: formData.themeColor,
        fontPreference: formData.fontPreference,
        aiPersonality: formData.aiPersonality,
        isAnonymous: formData.isAnonymous,
      }
    }));
    document.documentElement.style.setProperty('--primary', formData.themeColor);
    setIsEditing(false);
  };

  return (
    <div className={cn("p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col max-w-5xl mx-auto overflow-y-auto",
      formData.fontPreference === 'mono' ? 'font-mono' : formData.fontPreference === 'serif' ? 'font-serif' : 'font-sans')}>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Profile Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500">Customize your ATHENA experience.</p>
        </div>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={cn("btn-primary flex items-center justify-center gap-2 shadow-xl w-full sm:w-auto text-sm min-h-[44px]", isEditing && "bg-emerald-600")}>
          {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit3 size={18} /> Edit Profile</>}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="glass p-5 sm:p-6 md:p-8 rounded-[32px] sm:rounded-[40px] flex flex-col items-center text-center gap-4 sm:gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-primary/10 to-secondary/10" />
            <div className="relative mt-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[32px] bg-white dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-3xl shadow-xl overflow-hidden border-4 border-white dark:border-slate-900">
                {user?.name?.[0] || 'S'}
              </div>
            </div>
            <div className="z-10">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{user?.department}</p>
            </div>
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />
            <div className="grid grid-cols-3 gap-2 w-full">
              {[
                { label: 'Level', value: calcLevel(profile?.xp || 0), color: 'text-primary' },
                { label: 'Streak', value: `${profile?.streak || 0}`, color: 'text-orange-500' },
                { label: 'XP', value: profile?.xp || 0, color: 'text-primary' },
              ].map(s => (
                <div key={s.label} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                  <p className={cn("text-sm font-bold", s.color)}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="glass p-5 sm:p-6 md:p-8 rounded-[40px] space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3">
              <UserCircle size={20} className="text-emerald-500" />
              <h3 className="font-bold text-sm sm:text-base">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                <input type="text" disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-base"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
                <input type="text" disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-base"
                  value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Year of Study</label>
              <select disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-base"
                value={formData.yearOfStudy} onChange={e => setFormData({ ...formData, yearOfStudy: parseInt(e.target.value) })}>
                {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass p-5 sm:p-6 md:p-8 rounded-[40px] space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3">
                <Brain size={20} className="text-purple-500" />
                <h3 className="font-bold text-sm sm:text-base">AI Personality</h3>
              </div>
              <div className="space-y-2">
                {personalities.map(p => (
                  <button key={p.id} disabled={!isEditing}
                    onClick={() => setFormData({ ...formData, aiPersonality: p.id as any })}
                    className={cn("w-full p-3 rounded-2xl text-left transition-all border-2 flex items-center justify-between",
                      formData.aiPersonality === p.id ? "bg-primary/5 border-primary" : "bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700")}>
                    <div>
                      <p className={cn("font-bold text-xs", formData.aiPersonality === p.id ? "text-primary" : "text-slate-700 dark:text-slate-200")}>{p.label}</p>
                      <p className="text-[10px] text-slate-500">{p.desc}</p>
                    </div>
                    {formData.aiPersonality === p.id && <CheckCircle2 size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass p-5 sm:p-6 md:p-8 rounded-[40px] space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3">
                <Palette size={20} className="text-emerald-500" />
                <h3 className="font-bold text-sm sm:text-base">Appearance</h3>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Accent Color</label>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {themeColors.map(c => (
                    <button key={c} disabled={!isEditing} onClick={() => setFormData({ ...formData, themeColor: c })}
                      className={cn("w-full aspect-square rounded-xl transition-all border-4 min-h-[36px]",
                        formData.themeColor === c ? "border-white shadow-lg scale-110" : "border-transparent")}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Privacy</label>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Anonymous Mode</span>
                  <button disabled={!isEditing}
                    onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                    className={cn("w-11 h-5 rounded-full transition-all relative", formData.isAnonymous ? "bg-primary" : "bg-slate-300")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm", formData.isAnonymous ? "right-0.5" : "left-0.5")} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all min-h-[48px]">
          <LogOut size={18} /> Logout
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-2">You can log back in with your credentials anytime.</p>
      </div>
    </div>
  );
};

export default Profile;
