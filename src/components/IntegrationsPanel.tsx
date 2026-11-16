import React, { useMemo, useRef, useState } from 'react';
import {
  Plug, CheckCircle2, XCircle, Upload, RefreshCw, Save, Download,
  Users, BookOpen, Award, ShieldCheck, Activity,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  getSisConfig, saveSisConfig, testSisConnection, pullStudents,
  importStudentsCsv, importCoursesCsv, importResultsCsv,
  integrationReadiness, getLastSync, type SisConfig, type ImportResult,
} from '../lib/integration';

type ImportKind = 'students' | 'courses' | 'results';

const ImportCard: React.FC<{
  kind: ImportKind;
  title: string;
  icon: React.ElementType;
  hint: string;
  onDone: (r: ImportResult) => void;
}> = ({ kind, title, icon: Icon, hint, onDone }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const fn = kind === 'students' ? importStudentsCsv : kind === 'courses' ? importCoursesCsv : importResultsCsv;
      const r = fn(text);
      setResult(r);
      onDone(r);
    } catch (e: any) {
      setResult({ imported: 0, skipped: 0, total: 0, warnings: [e?.message || 'Import failed'] });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 rounded-2xl border border-white/10 dark:border-white/5 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="text-primary" />
        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{title}</h4>
      </div>
      <p className="text-[10px] text-slate-400 mb-3">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all min-h-[42px] disabled:opacity-50"
      >
        {busy ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
        {busy ? 'Importing…' : 'Choose CSV'}
      </button>
      {result && (
        <div className="mt-2 text-[10px] space-y-0.5">
          <p className="font-bold text-emerald-600">Imported {result.imported} · Skipped {result.skipped} · Total {result.total}</p>
          {result.warnings.slice(0, 3).map((w, i) => (
            <p key={i} className="text-amber-600">{w}</p>
          ))}
        </div>
      )}
    </div>
  );
};

const IntegrationsPanel: React.FC = () => {
  const [config, setConfig] = useState<SisConfig>(getSisConfig());
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [conn, setConn] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pullMsg, setPullMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const readiness = useMemo(() => integrationReadiness(), [refreshKey, config]);
  const lastSync = getLastSync();

  const set = (patch: Partial<SisConfig>) => { setConfig(prev => ({ ...prev, ...patch })); setSaved(false); };

  const save = () => { saveSisConfig(config); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const test = async () => {
    setTesting(true);
    setConn(null);
    const r = await testSisConnection(config);
    setConn(r);
    setTesting(false);
  };

  const pull = async () => {
    setPulling(true);
    setPullMsg(null);
    const r = await pullStudents(config);
    setPullMsg(r.message);
    setPulling(false);
    setRefreshKey(k => k + 1);
  };

  const downloadTemplate = (kind: ImportKind) => {
    const headers: Record<ImportKind, string> = {
      students: 'name,email,student_id,department,level',
      courses: 'code,title,department,credits,year,level',
      results: 'student_name,student_id,course,score,department',
    };
    const blob = new Blob([headers[kind] + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academiaiq-${kind}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Readiness */}
      <div className="glass-strong p-4 sm:p-6 rounded-[24px] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Plug size={20} className="text-primary" />
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">SIS Integration Readiness</h3>
            <p className="text-[10px] text-slate-400">Live status for connecting a school management system (e.g. EduManager)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {readiness.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-slate-800/40">
              {item.ok
                ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                : <XCircle size={16} className="text-amber-500 shrink-0" />}
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white">{item.label}</p>
                <p className="text-[10px] text-slate-400 truncate">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-3">
          Last sync: {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
        </p>
      </div>

      {/* Connection config */}
      <div className="glass-strong p-4 sm:p-6 rounded-[24px] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-indigo-500" />
          <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">Connection Settings</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Provider
            <input value={config.provider} onChange={e => set({ provider: e.target.value })} className="input-field mt-1" placeholder="EduManager" />
          </label>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            API Base URL
            <input value={config.baseUrl} onChange={e => set({ baseUrl: e.target.value })} className="input-field mt-1" placeholder="https://api.provider.com/v1" />
          </label>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            API Key / Token
            <input value={config.apiKey} onChange={e => set({ apiKey: e.target.value })} className="input-field mt-1" placeholder="paste key" type="password" />
          </label>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Health Path
            <input value={config.healthPath} onChange={e => set({ healthPath: e.target.value })} className="input-field mt-1" placeholder="/health" />
          </label>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Students Path
            <input value={config.studentsPath} onChange={e => set({ studentsPath: e.target.value })} className="input-field mt-1" placeholder="/students" />
          </label>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Courses Path
            <input value={config.coursesPath} onChange={e => set({ coursesPath: e.target.value })} className="input-field mt-1" placeholder="/courses" />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={save} className="btn-primary px-4 py-2 text-xs font-bold min-h-[42px] flex items-center gap-2">
            <Save size={14} /> {saved ? 'Saved ✓' : 'Save settings'}
          </button>
          <button onClick={test} disabled={testing} className="px-4 py-2 rounded-xl text-xs font-bold min-h-[42px] flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary transition-all disabled:opacity-50">
            {testing ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />} Test connection
          </button>
          <button onClick={pull} disabled={pulling || !config.baseUrl} className="px-4 py-2 rounded-xl text-xs font-bold min-h-[42px] flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary transition-all disabled:opacity-50">
            {pulling ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />} Pull students
          </button>
        </div>

        {conn && (
          <div className={cn('text-[11px] font-bold p-2.5 rounded-xl border',
            conn.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800')}>
            {conn.ok ? '✓ ' : '⚠ '} {conn.message}{conn.latencyMs ? ` · ${conn.latencyMs}ms` : ''}
          </div>
        )}
        {pullMsg && (
          <div className="text-[11px] font-bold p-2.5 rounded-xl border bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700">
            {pullMsg}
          </div>
        )}
      </div>

      {/* CSV imports */}
      <div className="glass-strong p-4 sm:p-6 rounded-[24px] border border-white/20 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Upload size={20} className="text-emerald-500" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">CSV Import</h3>
              <p className="text-[10px] text-slate-400">Works with any portal export — no API required.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ImportCard kind="students" title="Students" icon={Users} hint="Columns: name, email, student_id, department, level" onDone={() => setRefreshKey(k => k + 1)} />
          <ImportCard kind="courses" title="Courses" icon={BookOpen} hint="Columns: code, title, department, credits, year, level" onDone={() => setRefreshKey(k => k + 1)} />
          <ImportCard kind="results" title="Results / Grades" icon={Award} hint="Columns: student_name, student_id, course, score" onDone={() => setRefreshKey(k => k + 1)} />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={() => downloadTemplate('students')} className="text-[10px] font-bold text-primary hover:underline">Download students template</button>
          <button onClick={() => downloadTemplate('courses')} className="text-[10px] font-bold text-primary hover:underline">Download courses template</button>
          <button onClick={() => downloadTemplate('results')} className="text-[10px] font-bold text-primary hover:underline">Download results template</button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPanel;
