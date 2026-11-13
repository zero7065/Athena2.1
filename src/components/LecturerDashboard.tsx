/*
 * CampusIQ — Lecturer Dashboard
 *
 * Teacher view: students overview, pending submissions to grade,
 * assignments management, study room creation, and course curriculum editing.
 */

import React, { useState, useMemo } from 'react';
import { Users, CheckSquare, Plus, GraduationCap, BookOpen, Award, TrendingUp, Clock, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSubmissions, getAssignments, saveAssignment, deleteAssignment, Assignment, Submission, getAllCourses, addCourse, deleteCourse, saveCourses } from '../lib/storage';
import { loadData } from '../lib/storage';
import { cn } from '../lib/utils';
import type { Course } from '../types';

const emptyCourse: Course = {
    id: '',
    code: '',
    title: '',
    department: '',
    credits: 3,
    yearOfStudy: 1,
    level: 1,
    program: '',
    bio: '',
    location: { campus: 'Main', city: 'Campus', country: 'UNITED STATES' },
    interests: [],
    subjects: [],
    skills: [],
    joinDate: Date.now(),
  };

const LecturerDashboard: React.FC = () => {
  const { user, appData } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'assignments' | 'rooms' | 'courses'>('overview');
  const [newCourse, setNewCourse] = useState<Course>(emptyCourse);

  const allUsers = useMemo(() => loadData('users', []), []);
  const students = useMemo(() => allUsers.filter((u: any) => u.role === 'student'), [allUsers]);
  const submissions = useMemo(() => getSubmissions().filter(s => s.status === 'submitted' || s.status === 'graded'), []);
  const assignments = useMemo(() => getAssignments().filter(a => a.createdBy === user?.email), [user?.email]);
  const allCourses = useMemo(() => getAllCourses(), []);

  const pendingGrading = submissions.filter(s => s.status === 'submitted').length;
  const totalStudents = students.length;
  const totalAssignments = assignments.length;
  const avgScore = submissions.filter(s => s.status === 'graded').reduce((acc, s) => acc + s.score, 0) / Math.max(1, submissions.filter(s => s.status === 'graded').length);

  const handleDeleteCourse = (id: string) => {
    deleteCourse(id);
  };

  const handleSaveCourse = () => {
    const courseData = newCourse;
    addCourse({
      ...courseData,
      id: `course_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    });
    setNewCourse(emptyCourse);
  };

  const handleOpenAdd = () => {
    const el = document.getElementById('add-course-form');
    if (el) el.style.display = 'block';
  };

  const handleCloseAdd = () => {
    const el = document.getElementById('add-course-form');
    if (el) el.style.display = 'none';
    setNewCourse(emptyCourse);
  };

  /* --- COURSES TAB --- */
  if (activeTab === 'courses') {
    return (
      <div className="p-3 sm:p-5 md:p-8 space-y-4 h-full flex flex-col overflow-y-auto">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Courses Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              <BookOpen size={12} className="text-[#00843D]" /> Add, edit, and manage course curriculum.
            </p>
          </div>
          <button onClick={handleOpenAdd} className="btn-primary px-4 py-2 rounded-xl text-sm font-bold">
            Add Course
          </button>
        </header>

        {/* Courses grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCourses.map(course => (
            <div key={course.id} className="glass-card p-4 rounded-xl border-b-4 border-primary/50 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{course.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{course.code} · {course.department}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Credits: {course.credits} | Level {course.level} | Year {course.yearOfStudy}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDeleteCourse(course.id)} className="p-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs hover:text-red-800 transition-all" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add course form */}
        <div id="add-course-form" style={{ display: 'none' }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Add New Course</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveCourse(); }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Course Code</label>
              <input type="text" placeholder="CS101" value={newCourse.code} onChange={e => setNewCourse({ ...newCourse, code: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Course Title</label>
              <input type="text" placeholder="Programming Fundamentals" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Department</label>
              <input type="text" placeholder="Computer Science" value={newCourse.department} onChange={e => setNewCourse({ ...newCourse, department: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Credits</label>
                <input type="number" value={newCourse.credits} onChange={e => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 3 })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Year</label>
                <input type="number" value={newCourse.yearOfStudy} onChange={e => setNewCourse({ ...newCourse, yearOfStudy: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Level</label>
                <input type="number" value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Program</label>
                <select value={newCourse.program} onChange={e => setNewCourse({ ...newCourse, program: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none">
                  <option value="BSc Computer Science">BSc Computer Science</option>
                  <option value="BSc Mathematics">BSc Mathematics</option>
                  <option value="BSc Physics">BSc Physics</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Bio / Description</label>
              <textarea value={newCourse.bio} onChange={e => setNewCourse({ ...newCourse, bio: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none min-h-[80px]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Campus</label>
                <input type="text" placeholder="Main Campus" value={newCourse.location.campus} onChange={e => setNewCourse({ ...newCourse, location: { ...newCourse.location, campus: e.target.value } })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">City</label>
                <input type="text" placeholder="City" value={newCourse.location.city} onChange={e => setNewCourse({ ...newCourse, location: { ...newCourse.location, city: e.target.value } })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Country</label>
                <input type="text" placeholder="Country" value={newCourse.location.country} onChange={e => setNewCourse({ ...newCourse, location: { ...newCourse.location, country: e.target.value } })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleCloseAdd} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-emerald-600 transition-all">Add Course</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* --- OVERVIEW TAB --- */
  if (activeTab === 'overview') {
    return (
      <div className="p-3 sm:p-5 md:p-8 space-y-4 h-full flex flex-col overflow-y-auto">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Lecturer Portal — {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5">
              <GraduationCap size={12} className="text-[#00843D]" /> Manage courses, grade work, and track student progress.
            </p>
          </div>
        </header>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Students', value: totalStudents, icon: Users, color: 'text-blue-500' },
            { label: 'To Grade', value: pendingGrading, icon: CheckSquare, color: 'text-amber-500' },
            { label: 'Assignments', value: totalAssignments, icon: BookOpen, color: 'text-purple-500' },
            { label: 'Avg Score', value: Math.round(avgScore), icon: Award, color: 'text-emerald-500' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={cn("p-3 rounded-xl bg-white/60 dark:bg-slate-800/60", s.color)}>
                  <s.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">{s.label}</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button onClick={() => setActiveTab('submissions')} className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-xl transition-all">
              <CheckSquare size={24} className="text-amber-500" />
              <p className="font-bold text-xs text-slate-800 dark:text-white">Grade Submissions</p>
              <p className="text-[10px] text-slate-400">{pendingGrading} pending</p>
            </button>
            <button onClick={() => setActiveTab('assignments')} className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-xl transition-all">
              <Plus size={24} className="text-purple-500" />
              <p className="font-bold text-xs text-slate-800 dark:text-white">Create Assignment</p>
              <p className="text-[10px] text-slate-400">{totalAssignments} active</p>
            </button>
            <button onClick={() => setActiveTab('rooms')} className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-xl transition-all">
              <Users size={24} className="text-blue-500" />
              <p className="font-bold text-xs text-slate-800 dark:text-white">Study Rooms</p>
              <p className="text-[10px] text-slate-400">Manage rooms</p>
            </button>
            <button onClick={() => setActiveTab('courses')} className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-xl transition-all">
              <BookOpen size={24} className="text-emerald-500" />
              <p className="font-bold text-xs text-slate-800 dark:text-white">Courses</p>
              <p className="text-[10px] text-slate-400">{allCourses.length} active</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --- SUBMISSIONS TAB --- */
  if (activeTab === 'submissions') {
    return (
      <div className="p-3 sm:p-5 md:p-8 space-y-4 h-full flex flex-col overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Submissions to Grade</h2>
        </header>
        {submissions.length === 0 ? (
          <div className="glass p-8 text-center">
            <CheckSquare size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto flex-1">
            {submissions.map(s => (
              <div key={s.id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        s.status === 'submitted' ? 'bg-amber-100 text-amber-600' :
                        s.status === 'graded' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-100 text-slate-500'
                      )}>{s.status}</span>
                      <span className="text-xs text-slate-400">{new Date(s.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{s.assignmentTitle}</p>
                    <p className="text-xs text-slate-500">{s.studentName} · {s.studentDepartment}</p>
                  </div>
                  <button className="btn-primary px-4 py-2 text-sm min-h-[44px]">
                    {s.status === 'submitted' ? 'Grade' : 'View'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* --- ASSIGNMENTS TAB --- */
  if (activeTab === 'assignments') {
    const [showForm, setShowForm] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', points: 100 });

    const handleCreate = () => {
      if (!newAssignment.title.trim() || !newAssignment.dueDate) return;
      const assignment: Assignment = {
        id: Date.now().toString(36),
        title: newAssignment.title.trim(),
        description: newAssignment.description.trim(),
        dueDate: newAssignment.dueDate,
        points: newAssignment.points,
        createdBy: user?.email || '',
        createdAt: Date.now(),
      };
      saveAssignment(assignment);
      setNewAssignment({ title: '', description: '', dueDate: '', points: 100 });
      setShowForm(false);
    };

    return (
      <div className="p-3 sm:p-5 md:p-8 space-y-4 h-full flex flex-col overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Assignments</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 text-sm min-h-[44px] flex items-center gap-2">
            <Plus size={16} /> {showForm ? 'Cancel' : 'Create Assignment'}
          </button>
        </header>

        {showForm && (
          <div className="glass-card p-4 space-y-3">
            <input type="text" placeholder="Title" value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
            <textarea placeholder="Description" value={newAssignment.description} onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none min-h-[80px]" />
            <div className="flex gap-3">
              <input type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
              <input type="number" placeholder="Points" value={newAssignment.points} onChange={e => setNewAssignment({ ...newAssignment, points: parseInt(e.target.value) })} className="w-32 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <button onClick={handleCreate} className="btn-primary w-full py-2.5 text-sm min-h-[44px]">Create</button>
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="glass p-8 text-center">
            <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No assignments created yet</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto flex-1">
            {assignments.map(a => (
              <div key={a.id} className="glass-card p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 dark:text-white">{a.title}</p>
                  <p className="text-xs text-slate-500">Due: {new Date(a.dueDate).toLocaleDateString()} · {a.points} pts</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{a.description}</p>
                </div>
                <button onClick={() => deleteAssignment(a.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <CheckSquare size={16} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* --- ROOMS TAB --- */
  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 h-full flex flex-col overflow-y-auto">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Study Rooms</h2>
      <div className="glass p-8 text-center">
        <Users size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="text-sm text-slate-500">Study room management coming soon</p>
      </div>
    </div>
  );
};

export default LecturerDashboard;
