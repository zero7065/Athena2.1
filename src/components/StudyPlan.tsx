import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safeGroq } from '../lib/groq';
import { getSyllabi } from '../lib/storage';
import { Syllabus } from '../types';

const StudyPlan: React.FC = () => {
  const { user } = useAuth();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [course, setCourse] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const list = getSyllabi();
    const latest = list[list.length - 1];
    if (latest) {
      setSyllabi([latest]);
      setCourse(latest.course);
    }
  }, []);

  const generate = async () => {
    if (syllabi.length === 0) {
      setPlan('No syllabus available yet. Ask a lecturer to create one first.');
      return;
    }
    const s = syllabi[0];
    setLoading(true);
    const prompt = [
      'You are UniPulse, the academic assistant for the university.',
      'Create a detailed, personalized study plan for the student based on the course syllabus.',
      `Course: ${s.course} - ${s.title}`,
      `Subject: ${s.subject}`,
      `Instructor: ${s.instructor}`,
      `Learning Objectives: ${s.objectives.join('\n')}`,
      `Modules: ${s.modules.map(m => `${m.title}: ${m.topics.join(', ')}`).join('; ')}`,
    ].join('\n');
    const text = await safeGroq(prompt, `Student ${user?.name} (${user?.email}) needs a study plan.`, 'mixtral-8x7b-32768', 'Study plan generation failed. Please try again later.');
    setPlan(text);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">AI Study Plan</h2>
        <button onClick={generate} className="btn-primary px-4 py-2 text-sm min-h-[44px] flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? 'Generating...' : 'Generate Study Plan'}
        </button>
      </div>

      <div className="glass p-4 sm:p-5 rounded-2xl space-y-3 max-w-2xl">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          <p className="text-sm font-bold text-slate-800 dark:text-white">Based on latest syllabus</p>
        </div>
        <select value={course} onChange={e => setCourse(e.target.value)} className="input-field">
          <option value="">Select course</option>
          {syllabi.map(s => (
            <option key={s.id} value={s.course}>{s.course} - {s.title}</option>
          ))}
        </select>
        <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{plan || 'Click "Generate Study Plan" to create your personalized study plan from the syllabus.'}</div>
      </div>

      {syllabi.length > 0 && (
        <div className="glass p-6 text-center">
          <GraduationCap size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500 font-medium">Your AI study plan will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default StudyPlan;
