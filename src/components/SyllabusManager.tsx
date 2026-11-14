import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSyllabi, saveSyllabus, deleteSyllabus } from '../lib/storage';
import type { Syllabus } from '../types';
import { safeGroq } from '../lib/groq';

const Subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

const SyllabusManager: React.FC = () => {
  const { user } = useAuth();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [course, setCourse] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [objectives, setObjectives] = useState('');
  const [modules, setModules] = useState<Array<{ title: string; topics: string }>>([{ title: '', topics: '' }]);

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiObjectives, setAiObjectives] = useState('');
  const [aiModules, setAiModules] = useState<Array<{ title: string; topics: string }>>([]);

  useEffect(() => {
    setSyllabi(getSyllabi());
  }, []);

  const isTeacher = user?.role === 'admin' || user?.role === 'management' || user?.role === 'lecturer';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const syllabus: Syllabus = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      course: course.trim(),
      title: title.trim(),
      subject,
      instructor: user.name,
      instructorEmail: user.email,
      objectives: objectives.split('\n').map(o => o.trim()).filter(Boolean),
      modules: modules.filter(m => m.title.trim()).map(m => ({ id: m.title + '_' + Math.random().toString(36).slice(2, 6), title: m.title.trim(), topics: m.topics.split('\n').map(t => t.trim()).filter(Boolean), resources: [] })),
      createdAt: Date.now(),
    };
    setSyllabi(saveSyllabus(syllabus));
    setCourse(''); setTitle(''); setObjectives(''); setModules([{ title: '', topics: '' }]);
  };

  const handleDelete = (id: string) => {
    setSyllabi(deleteSyllabus(id));
  };

  const generateAiSyllabus = useCallback(async () => {
    if (!course.trim() || aiGenerating) return;
    setAiGenerating(true);
    try {
      const result = await safeGroq(
        'You are an expert curriculum designer. Create a detailed syllabus outline for a university course. Return ONLY a JSON object with "objectives" (array of 4-6 learning objectives) and "modules" (array of 4-6 modules, each with "title" and "topics" array of 3-5 topics).',
        `Course: ${course}\nSubject: ${subject}\nCreate a comprehensive syllabus with learning objectives and module breakdown.`,
        'llama-3.1-8b-instant',
        '{"objectives": ["Understand fundamentals", "Apply concepts", "Analyze case studies", "Create projects"], "modules": [{"title": "Introduction", "topics": ["Overview", "History", "Key concepts"]}]}',
      );
      try {
        const parsed = JSON.parse(result);
        if (parsed.objectives && Array.isArray(parsed.objectives)) {
          setObjectives(parsed.objectives.join('\n'));
        }
        if (parsed.modules && Array.isArray(parsed.modules)) {
          setAiModules(parsed.modules.map((m: any) => ({ title: String(m.title || 'Module'), topics: Array.isArray(m.topics) ? m.topics.join('\n') : String(m.topics || '') })));
        }
      } catch {
        setAiObjectives(prev => prev || 'Understand core concepts\nApply knowledge to real problems\nAnalyze and evaluate\nCreate and synthesize');
        setAiModules([{ title: 'Introduction', topics: 'Overview\nKey concepts\nApplications' }]);
      }
    } catch {
      setAiObjectives(prev => prev || 'Understand core concepts\nApply knowledge to real problems\nAnalyze and evaluate\nCreate and synthesize');
      setAiModules([{ title: 'Introduction', topics: 'Overview\nKey concepts\nApplications' }]);
    } finally {
      setAiGenerating(false);
    }
  }, [course, subject, aiGenerating]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Course Syllabi</h2>
        {isTeacher && (
          <button onClick={() => setModules([{ title: '', topics: '' }])} className="btn-primary px-4 py-2 text-sm min-h-[44px] flex items-center gap-2">
            <Plus size={16} /> New Syllabus
          </button>
        )}
      </div>

      {syllabi.length === 0 ? (
        <div className="glass p-6 text-center">
          <GraduationCap size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500 font-medium">No syllabi yet</p>
          {isTeacher && <p className="text-xs text-slate-400 mt-1">Create a syllabus to structure the course.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {syllabi.map(s => (
            <div key={s.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{s.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.course} · {s.subject} · Instructor: {s.instructor}</p>
                  {s.objectives.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Learning Objectives</p>
                      <ul className="space-y-0.5">
                        {s.objectives.map((o, i) => <li key={i} className="text-[11px] text-slate-600 dark:text-slate-300">• {o}</li>)}
                      </ul>
                    </div>
                  )}
                  {s.modules.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Modules</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.modules.map(m => (
                          <span key={m.id} className="badge badge-primary">{m.title}{m.topics.length ? ` (${m.topics.length} topics)` : ''}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {isTeacher && (
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-[44px] min-w-[44px]">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isTeacher && (
        <form onSubmit={handleCreate} className="glass p-4 sm:p-5 rounded-2xl space-y-3 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Create Course Syllabus</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <input type="text" placeholder="Course code / name" value={course} onChange={e => setCourse(e.target.value)} className="input-field" required />
              {course.trim() && (
                <button onClick={generateAiSyllabus} disabled={aiGenerating} className="px-2 py-1.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors min-h-[36px] flex items-center gap-1">
                  <Sparkles size={14} className={aiGenerating ? 'animate-spin' : ''} />
                  {aiGenerating ? 'Generating...' : 'AI Generate'}
                </button>
              )}
            </div>
            <input type="text" placeholder="Course title" value={title} onChange={e => setTitle(e.target.value)} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field">
              {Subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Instructor name" value={user?.name || ''} disabled className="input-field" />
          </div>
          <div className="flex flex-col gap-1">
            <textarea placeholder="Learning objectives (one per line)" value={objectives} onChange={e => setObjectives(e.target.value)} className="input-field min-h-[80px]" />
            {objectives.trim() || aiObjectives ? (
              <button onClick={() => {
                if (aiObjectives && !objectives) setObjectives(aiObjectives);
                if (aiModules.length > 0) setModules(aiModules);
              }} className="px-2 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors min-h-[36px] flex items-center gap-1">
                <Sparkles size={14} />
                Apply AI
              </button>
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modules</p>
            {modules.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" placeholder="Module title" value={m.title} onChange={e => { const n = [...modules]; n[i] = { ...m, title: e.target.value }; setModules(n); }} className="input-field flex-1" />
                <input type="text" placeholder="Topics (one per line)" value={m.topics} onChange={e => { const n = [...modules]; n[i] = { ...m, topics: e.target.value }; setModules(n); }} className="input-field flex-2" />
              </div>
            ))}
            <button type="button" onClick={() => setModules([...modules, { title: '', topics: '' }])} className="btn-secondary px-4 py-2 text-sm min-h-[44px] flex items-center gap-2">
              <Plus size={16} /> Add Module
            </button>
          </div>
          <button type="submit" className="btn-primary px-4 py-2 text-sm min-h-[44px]">Save Syllabus</button>
        </form>
      )}
    </div>
  );
};

export default SyllabusManager;
