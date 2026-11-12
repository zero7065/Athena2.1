import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, FileText, Link as LinkIcon, Video, Presentation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getContentResources, saveContentResource, deleteContentResource, ContentResource } from '../lib/storage';
import { cn } from '../lib/utils';

const TYPE_ICONS: Record<string, React.ElementType> = {
  note: FileText, pdf: FileText, link: LinkIcon, video: Video, slides: Presentation,
};

const Subjects = ['All', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

const ContentLibrary: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<ContentResource[]>([]);
  const [subject, setSubject] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [resSubject, setResSubject] = useState('Mathematics');
  const [resType, setResType] = useState<ContentResource['type']>('note');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    setResources(getContentResources());
  }, []);

  const isTeacher = user?.role === 'admin' || user?.role === 'management' || user?.role === 'lecturer';

  const subjects = ['All', ...Array.from(new Set(resources.map(r => r.subject).filter(Boolean)))];

  const filtered = subject === 'All' ? resources : resources.filter(r => r.subject === subject);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const r: ContentResource = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: title.trim(),
      subject: resSubject,
      type: resType,
      url: url.trim() || undefined,
      description: description.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdBy: user.name,
      createdByEmail: user.email,
      createdAt: Date.now(),
    };
    setResources(saveContentResource(r));
    setShowForm(false);
    setTitle(''); setUrl(''); setDescription(''); setTags(''); setResSubject('Mathematics');
  };

  const handleDelete = (id: string) => {
    setResources(deleteContentResource(id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Content Library</h2>
        {isTeacher && (
          <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-sm min-h-[44px] flex items-center gap-2">
            <Plus size={16} /> Add Resource
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {subjects.map(s => (
          <button key={s} onClick={() => setSubject(s)}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] whitespace-nowrap",
              subject === s ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700')}>
            {s}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="glass p-4 sm:p-5 rounded-2xl space-y-3 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Add Learning Resource</h3>
          <input type="text" placeholder="Resource title" value={title} onChange={e => setTitle(e.target.value)} className="input-field" required />
          <div className="grid grid-cols-2 gap-3">
            <select value={resSubject} onChange={e => setResSubject(e.target.value)} className="input-field">
              {Subjects.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={resType} onChange={e => setResType(e.target.value as ContentResource['type'])} className="input-field">
              {['note', 'pdf', 'link', 'video', 'slides'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <input type="text" placeholder="URL (optional)" value={url} onChange={e => setUrl(e.target.value)} className="input-field" />
          <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="input-field min-h-[80px]" />
          <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} className="input-field" />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary px-4 py-2 text-sm min-h-[44px]">Save Resource</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2 text-sm min-h-[44px]">Cancel</button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className="glass p-6 text-center">
          <BookOpen size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500 font-medium">No learning resources yet</p>
          {isTeacher && <p className="text-xs text-slate-400 mt-1">Add your first resource to get started.</p>}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map(r => {
            const Icon = TYPE_ICONS[r.type] || FileText;
            return (
              <div key={r.id} className="glass-card p-4 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{r.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{r.subject} · {r.type}{r.url ? ` · ${r.url}` : ''}</p>
                  {r.description && <p className="text-[11px] text-slate-400 mt-0.5">{r.description}</p>}
                  {r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {r.tags.map(t => <span key={t} className="badge badge-primary">{t}</span>)}
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400 mt-1.5">Added by {r.createdBy} · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                {isTeacher && (
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-[44px] min-w-[44px]">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;
