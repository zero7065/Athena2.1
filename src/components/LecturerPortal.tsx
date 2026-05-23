/*
 * ATHENA - Student Success Platform
 * Section: LECTURER PORTAL
 *
 * - Students list with progress tracking
 * - Submissions: review, grade, give feedback
 * - Create assignments for students
 * - CSV export with full student data
 * - Google Sheets-ready export format
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  BookOpen, Users, CheckCircle, Clock, Search, Download,
  GraduationCap, Trophy,
  Plus, X, Eye, User, FileText, DoorOpen, Hash, Copy, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { loadData, getSubmissions, saveSubmission, getAssignments, saveAssignment, deleteAssignment, Submission, Assignment, LocalTask, getRooms, saveRoom, deleteRoom, generateRoomCode, StudyRoom } from '../lib/storage';

const LecturerPortal: React.FC = () => {
  const { user, appData, updateAppData, addUserXp } = useAuth();
  const [activeTab, setActiveTab] = useState<'students' | 'submissions' | 'assignments' | 'export' | 'rooms'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    points: 100,
  });
  const [confirmDeleteAssign, setConfirmDeleteAssign] = useState<string | null>(null);
  const [assignError, setAssignError] = useState('');
  const [copiedRoom, setCopiedRoom] = useState<string | null>(null);
  const [showDeleteRoom, setShowDeleteRoom] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ name: '', subject: '', description: '' });

  const allUsers = useMemo(() => loadData('users', []), []);
  const students = useMemo(() => allUsers.filter((u: any) => u.role === 'student'), [allUsers]);
  const myRooms = useMemo(() => getRooms().filter(r => r.createdByEmail === user?.email), [user?.email]);
  const submissions = useMemo(() => getSubmissions(), []);
  const assignments = useMemo(() => getAssignments(), []);

  // Stats
  const totalStudents = students.length;
  const pendingSubmissions = submissions.filter(s => s.status === 'submitted').length;
  const gradedSubmissions = submissions.filter(s => s.status === 'graded').length;
  const draftSubmissions = submissions.filter(s => s.status === 'draft').length;

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    let list = submissions;
    if (filterStatus === 'pending') list = list.filter(s => s.status === 'submitted');
    if (filterStatus === 'graded') list = list.filter(s => s.status === 'graded');
    if (selectedStudent) list = list.filter(s => s.studentId === selectedStudent);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.studentName.toLowerCase().includes(q) ||
        s.assignmentTitle.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (b.submittedAt || b.draftSavedAt || 0) - (a.submittedAt || a.draftSavedAt || 0));
  }, [submissions, filterStatus, selectedStudent, searchQuery]);

  // Student progress
  const studentProgress = useMemo(() => {
    return students.map((s: any) => {
      const studentSubs = submissions.filter(sub => sub.studentEmail === s.email);
      return {
        name: s.name,
        email: s.email,
        studentId: s.studentId || '',
        department: s.department || '',
        totalSubmissions: studentSubs.length,
        pending: studentSubs.filter(sub => sub.status === 'submitted').length,
        graded: studentSubs.filter(sub => sub.status === 'graded').length,
        averageScore: studentSubs.filter(sub => sub.status === 'graded').reduce((acc, sub) => acc + sub.score, 0) /
          (Math.max(1, studentSubs.filter(sub => sub.status === 'graded').length)),
      };
    });
  }, [students, submissions]);

  // Grade submission
  const handleGrade = useCallback((submissionId: string) => {
    const allSubs = getSubmissions();
    const sub = allSubs.find(s => s.id === submissionId);
    if (!sub) return;
    sub.status = 'graded';
    sub.score = gradeScore;
    sub.feedback = gradeFeedback;
    sub.gradedAt = Date.now();
    saveSubmission(sub);
    setGradingId(null);
    setGradeScore(0);
    setGradeFeedback('');
  }, [gradeScore, gradeFeedback]);

  // Create assignment
  const handleCreateAssignment = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setAssignError('');
    if (!newAssignment.title.trim()) {
      setAssignError('Assignment title is required');
      return;
    }
    const assignment: Assignment = {
      id: Date.now().toString(),
      title: newAssignment.title.trim(),
      description: newAssignment.description.trim(),
      dueDate: newAssignment.dueDate,
      points: newAssignment.points,
      createdBy: user?.email || '',
      createdAt: Date.now(),
    };
    saveAssignment(assignment);
    setShowCreateAssignment(false);
    setNewAssignment({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0], points: 100 });
  }, [newAssignment, user]);

  // Delete assignment
  const handleDeleteAssignment = (id: string) => {
    deleteAssignment(id);
    setConfirmDeleteAssign(null);
  };

  // Create room
  const handleCreateRoom = () => {
    if (!newRoomData.name.trim() || !newRoomData.subject.trim()) return;
    const code = generateRoomCode();
    const room: StudyRoom = {
      id: Date.now().toString(),
      name: newRoomData.name.trim(),
      subject: newRoomData.subject.trim(),
      code,
      createdBy: user?.name || '',
      createdByEmail: user?.email || '',
      createdAt: Date.now(),
      description: newRoomData.description.trim(),
      members: [{
        name: user?.name || '',
        email: user?.email || '',
        studentId: user?.studentId || '',
        role: 'lecturer',
        joinedAt: Date.now(),
      }],
      announcements: [],
    };
    saveRoom(room);
    setShowCreateRoom(false);
    setNewRoomData({ name: '', subject: '', description: '' });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedRoom(code);
    setTimeout(() => setCopiedRoom(null), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Student ID', 'Student Name', 'Email', 'Department', 'Assignment', 'Status', 'Score', 'Feedback', 'Submitted Date', 'Graded Date'],
    ];
    submissions.forEach(s => {
      rows.push([
        s.studentId,
        s.studentName,
        s.studentEmail,
        s.studentDepartment,
        s.assignmentTitle,
        s.status,
        s.status === 'graded' ? s.score.toString() : '',
        s.feedback,
        s.submittedAt ? new Date(s.submittedAt).toISOString().split('T')[0] : '',
        s.gradedAt ? new Date(s.gradedAt).toISOString().split('T')[0] : '',
      ]);
    });
    const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `athena_submissions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export student progress CSV
  const handleExportStudentCSV = () => {
    const rows = [
      ['Student ID', 'Student Name', 'Email', 'Department', 'Total Submissions', 'Pending', 'Graded', 'Average Score'],
    ];
    studentProgress.forEach(s => {
      rows.push([
        s.studentId,
        s.name,
        s.email,
        s.department,
        s.totalSubmissions.toString(),
        s.pending.toString(),
        s.graded.toString(),
        s.averageScore.toFixed(1),
      ]);
    });
    const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `athena_students_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'students' as const, label: 'Students', icon: Users, count: students.length },
    { id: 'submissions' as const, label: 'Submissions', icon: CheckCircle, count: pendingSubmissions },
    { id: 'assignments' as const, label: 'Assignments', icon: BookOpen, count: assignments.length },
    { id: 'rooms' as const, label: 'Rooms', icon: DoorOpen, count: myRooms.length },
    { id: 'export' as const, label: 'Export', icon: Download },
  ];

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col max-w-6xl mx-auto overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#00843D]/10 text-[#00843D] rounded-2xl shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Lecturer Portal</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{user?.name} &bull; {user?.department || 'Faculty'}</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Pending Review', value: pendingSubmissions, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Graded', value: gradedSubmissions, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Drafts', value: draftSubmissions, icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50' },
        ].map((s, i) => (
          <div key={i} className="glass p-4 rounded-2xl flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", s.bg, s.color)}>
              <s.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{s.label}</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 glass rounded-2xl w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px]",
              activeTab === tab.id ? "bg-[#00843D] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"
            )}>
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
              )}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* === STUDENTS TAB === */}
      {activeTab === 'students' && (
        <div className="glass p-5 sm:p-6 rounded-[32px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">All Students ({totalStudents})</h3>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Search students..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          {totalStudents === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No students registered yet.</p>
              <p className="text-xs mt-1">Students appear here once they create accounts.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <div className="min-w-[600px] px-5 sm:px-0 space-y-2">
                {studentProgress.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-[#00843D]/10 flex items-center justify-center text-[#00843D] font-bold text-sm shrink-0">
                        {s.name[0] || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{s.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{s.studentId}</span>
                          {s.studentId && <span>&bull;</span>}
                          <span>{s.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold shrink-0">
                      <span className="text-slate-400">{s.totalSubmissions} submissions</span>
                      {s.pending > 0 && <span className="text-orange-500">{s.pending} pending</span>}
                      {s.graded > 0 && <span className="text-emerald-500">{s.graded} graded</span>}
                      {s.averageScore > 0 && <span className="text-blue-500">Avg: {s.averageScore.toFixed(1)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === SUBMISSIONS TAB === */}
      {activeTab === 'submissions' && (
        <div className="glass p-5 sm:p-6 rounded-[32px] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              {selectedStudent ? `Submissions by ${students.find((s: any) => s.studentId === selectedStudent)?.name || selectedStudent}` : 'All Submissions'}
            </h3>
            <div className="flex items-center gap-2">
              <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none"
                value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="graded">Graded</option>
              </select>
              <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none"
                value={selectedStudent || ''} onChange={e => setSelectedStudent(e.target.value || null)}>
                <option value="">All Students</option>
                {students.map((s: any, i: number) => (
                  <option key={i} value={s.studentId}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No submissions yet.</p>
              <p className="text-xs mt-1">When students submit completed tasks, they'll appear here for grading.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <div className="min-w-[800px] px-5 sm:px-0 space-y-2">
                {filteredSubmissions.map(sub => (
                  <div key={sub.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("inline-block px-2 py-0.5 rounded-full text-[10px] font-bold",
                            sub.status === 'submitted' ? 'bg-orange-100 text-orange-700' :
                            sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-500'
                          )}>
                            {sub.status === 'submitted' ? 'Pending' : sub.status === 'graded' ? `Graded: ${sub.score}` : 'Draft'}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{sub.assignmentTitle}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <User size={12} className="inline mr-1 text-slate-400" />
                          {sub.studentName} ({sub.studentId})
                        </p>
                        {sub.description && <p className="text-xs text-slate-500 mt-1">{sub.description}</p>}
                        {sub.feedback && sub.status === 'graded' && (
                          <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                            <p className="text-[10px] font-bold text-blue-600 uppercase">Feedback</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{sub.feedback}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                          <span>Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Not yet'}</span>
                          {sub.gradedAt && <span>Graded: {new Date(sub.gradedAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {sub.status === 'submitted' && (
                          gradingId === sub.id ? (
                            <div className="space-y-2 min-w-[200px]">
                              <div className="flex items-center gap-2">
                                <input type="number" min="0" max="100" placeholder="Score"
                                  className="w-20 px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 text-sm outline-none"
                                  value={gradeScore} onChange={e => setGradeScore(parseInt(e.target.value) || 0)} />
                                <span className="text-[10px] text-slate-400">/100</span>
                              </div>
                              <textarea placeholder="Feedback..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 text-xs outline-none h-16 resize-none"
                                value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} />
                              <div className="flex gap-2">
                                <button onClick={() => handleGrade(sub.id)}
                                  className="flex-1 px-3 py-1.5 bg-[#00843D] text-white rounded-lg text-xs font-bold hover:bg-[#006a2f] transition-all">
                                  Save
                                </button>
                                <button onClick={() => { setGradingId(null); setGradeScore(0); setGradeFeedback(''); }}
                                  className="px-3 py-1.5 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setGradingId(sub.id); setGradeScore(0); setGradeFeedback(''); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#00843D]/10 text-[#00843D] rounded-lg text-xs font-bold hover:bg-[#00843D]/20 transition-all min-h-[36px]">
                              <Eye size={14} /> Grade
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === ASSIGNMENTS TAB === */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Assignments ({assignments.length})</h3>
            <button onClick={() => setShowCreateAssignment(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00843D] text-white rounded-xl text-xs font-bold hover:bg-[#006a2f] transition-all min-h-[44px]">
              <Plus size={16} /> New Assignment
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="glass p-8 rounded-[32px] text-center">
              <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-500">No assignments yet</h3>
              <p className="text-xs text-slate-400 mt-1">Create assignments for your students to complete and submit.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(a => (
                <div key={a.id} className="glass p-4 sm:p-5 rounded-[32px] flex items-start justify-between gap-3">
                  <div className="flex gap-3 min-w-0">
                    <div className="p-3 rounded-2xl bg-[#00843D]/10 text-[#00843D] shrink-0">
                      <FileText size={22} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{a.title}</h4>
                      {a.description && <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400">
                        <span>Due: {a.dueDate}</span>
                        <span className="text-primary">{a.points} pts</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {confirmDeleteAssign === a.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDeleteAssignment(a.id)}
                          className="text-xs font-bold text-red-500 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors">Delete</button>
                        <button onClick={() => setConfirmDeleteAssign(null)}
                          className="text-xs font-bold text-slate-400 px-2 py-1 rounded hover:bg-slate-100 transition-colors">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteAssign(a.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete assignment">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Assignment Modal */}
          {showCreateAssignment && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md sm:m-4"
                onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-5 text-slate-800 dark:text-white">Create Assignment</h2>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <input type="text" placeholder="Assignment Title" required
                      className={`w-full px-4 py-3 rounded-xl border ${assignError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base`}
                      value={newAssignment.title} onChange={e => { setNewAssignment({ ...newAssignment, title: e.target.value }); setAssignError(''); }} />
                    {assignError && <p className="text-xs text-red-500 mt-1">{assignError}</p>}
                  </div>
                  <textarea placeholder="Description (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary h-20 resize-none text-base"
                    value={newAssignment.description} onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Due Date</label>
                      <input type="date" required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                        value={newAssignment.dueDate} onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Points</label>
                      <input type="number" min="1" max="1000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                        value={newAssignment.points} onChange={e => setNewAssignment({ ...newAssignment, points: parseInt(e.target.value) || 100 })} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowCreateAssignment(false)}
                      className="flex-1 py-3 font-bold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 py-3 font-bold text-sm bg-[#00843D] text-white rounded-xl hover:bg-[#006a2f] transition-all">Create</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === ROOMS TAB === */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">My Study Rooms ({myRooms.length})</h3>
            <button onClick={() => setShowCreateRoom(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all min-h-[44px]">
              <Plus size={16} /> New Room
            </button>
          </div>

          {myRooms.length === 0 ? (
            <div className="glass p-8 rounded-[32px] text-center">
              <DoorOpen size={40} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-500">No study rooms yet</h3>
              <p className="text-xs text-slate-400 mt-1">Create a room and share the code with your students.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myRooms.map(room => (
                <div key={room.id} className="glass p-4 sm:p-5 rounded-[32px]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{room.name}</h4>
                        <p className="text-[10px] text-slate-400">{room.subject}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowDeleteRoom(room.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                      <X size={14} />
                    </button>
                  </div>
                  {room.description && <p className="text-xs text-slate-500 mb-2">{room.description}</p>}
                  <div className="flex items-center gap-2 mb-3">
                    <Hash size={14} className="text-primary shrink-0" />
                    <span className="text-sm font-mono font-bold text-primary tracking-wider">{room.code}</span>
                    <button onClick={() => copyCode(room.code)}
                      className="p-1 hover:bg-primary/10 rounded-lg transition-colors">
                      {copiedRoom === room.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Users size={14} />
                      <span>{room.members.length} member{room.members.length !== 1 ? 's' : ''}</span>
                      {room.announcements.length > 0 && (
                        <><span className="text-slate-300">|</span><span>{room.announcements.length} announcement{room.announcements.length !== 1 ? 's' : ''}</span></>
                      )}
                    </div>
                    <div className="flex -space-x-1.5">
                      {room.members.slice(0, 4).map((m, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-[8px] font-bold ${m.role === 'lecturer' ? 'bg-primary' : 'bg-slate-400'}`}
                          title={`${m.name} (${m.role})`}>
                          {m.name[0]}
                        </div>
                      ))}
                      {room.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">
                          +{room.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showDeleteRoom && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-2xl max-w-sm w-full mx-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Delete Room?</h3>
                <p className="text-xs text-slate-500 mb-4">All students will be removed from this room. This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteRoom(null)}
                    className="flex-1 py-3 font-bold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button onClick={() => { deleteRoom(showDeleteRoom); setShowDeleteRoom(null); }}
                    className="flex-1 py-3 font-bold text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all">Delete</button>
                </div>
              </div>
            </div>
          )}

          {showCreateRoom && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md sm:m-4">
                <h2 className="text-lg font-bold mb-5 text-slate-800 dark:text-white">Create Study Room</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Room Name (e.g. CSC 201 Study Group)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                    value={newRoomData.name} onChange={e => setNewRoomData({ ...newRoomData, name: e.target.value })} />
                  <input type="text" placeholder="Subject (e.g. Computer Science)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                    value={newRoomData.subject} onChange={e => setNewRoomData({ ...newRoomData, subject: e.target.value })} />
                  <textarea placeholder="Description (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary h-20 resize-none text-base"
                    value={newRoomData.description} onChange={e => setNewRoomData({ ...newRoomData, description: e.target.value })} />
                  <div className="flex gap-3">
                    <button onClick={() => { setShowCreateRoom(false); setNewRoomData({ name: '', subject: '', description: '' }); }}
                      className="flex-1 py-3 font-bold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleCreateRoom}
                      className="flex-1 py-3 font-bold text-sm bg-primary text-white rounded-xl hover:bg-emerald-700 transition-all">Create Room</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === EXPORT TAB === */}
      {activeTab === 'export' && (
        <div className="glass p-5 sm:p-6 rounded-[32px] space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Export Student Data</h3>
            <p className="text-xs text-slate-500 mb-4">Download organized CSV files ready to import into Google Sheets, Excel, or any spreadsheet tool.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <FileText size={24} className="text-blue-500 mb-3" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1">Submissions Report</h4>
              <p className="text-xs text-slate-500 mb-3">Student ID, Name, Email, Department, Assignment, Status, Score, Feedback, Dates</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3">
                <span>{submissions.length} submissions</span>
                <span>|</span>
                <span>{pendingSubmissions} pending</span>
                <span>|</span>
                <span>{gradedSubmissions} graded</span>
              </div>
              <button onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-[#00843D] text-white rounded-xl text-xs font-bold hover:bg-[#006a2f] transition-all min-h-[44px]">
                <Download size={16} /> Download CSV
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Users size={24} className="text-emerald-500 mb-3" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1">Student Progress</h4>
              <p className="text-xs text-slate-500 mb-3">Student ID, Name, Email, Department, Total Submissions, Pending, Graded, Average Score</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3">
                <span>{totalStudents} students</span>
              </div>
              <button onClick={handleExportStudentCSV}
                className="flex items-center gap-2 px-4 py-2 bg-[#00843D] text-white rounded-xl text-xs font-bold hover:bg-[#006a2f] transition-all min-h-[44px]">
                <Download size={16} /> Download CSV
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h5 className="text-xs font-bold text-blue-600 mb-1">Google Sheets Import</h5>
            <ol className="text-[10px] text-blue-500 space-y-1 list-decimal ml-4">
              <li>Download the CSV file above</li>
              <li>Open <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Sheets</a></li>
              <li>File → Import → Upload → Select the CSV file</li>
              <li>Choose "Replace current sheet" and click Import</li>
              <li>Your student data is now organized in a spreadsheet!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerPortal;