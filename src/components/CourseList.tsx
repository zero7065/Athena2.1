import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Course } from '../types';
import { getAllCourses, saveCourses, addCourse, deleteCourse } from '../lib/storage';

const COURSE_LABELS: Record<string, string> = {
  CS101: 'CS101 Programming',
  CS202: 'CS202 Data Structures',
  MATH201: 'MATH201 Calculus I',
  ENG101: 'ENG101 Writing I',
  PHY101: 'PHY101 Physics I',
};

const DEFAULT_COURSES: Course[] = [
  {
    id: 'course_cs101',
    code: 'CS101',
    title: 'CS101 Programming',
    department: 'Computer Science',
    credits: 3,
    yearOfStudy: 1,
    level: 1,
    program: 'BSc Computer Science',
    bio: 'Introduction to programming fundamentals using JavaScript.',
    location: { campus: 'Main', city: 'Campus', country: 'UNITED STATES' },
    interests: ['logic', 'coding', 'web', 'programming'],
    subjects: ['computer science', 'programming'],
    skills: ['javascript', 'debugging', 'logic'],
    joinDate: Date.now(),
  },
  {
    id: 'course_cs202',
    code: 'CS202',
    title: 'CS202 Data Structures',
    department: 'Computer Science',
    credits: 4,
    yearOfStudy: 2,
    level: 2,
    program: 'BSc Computer Science',
    bio: 'Core data structures and algorithms.',
    location: { campus: 'Main', city: 'Campus', country: 'UNITED STATES' },
    interests: ['algorithms', 'data structures', 'optimization'],
    subjects: ['computer science', 'algorithms'],
    skills: ['arrays', 'trees', 'graphs', 'hash maps'],
    joinDate: Date.now(),
  },
  {
    id: 'course_math201',
    code: 'MATH201',
    title: 'MATH201 Calculus I',
    department: 'Mathematics',
    credits: 4,
    yearOfStudy: 1,
    level: 1,
    program: 'BSc Computer Science',
    bio: 'Limits, derivatives, and integrals.',
    location: { campus: 'Main', city: 'Campus', country: 'UNITED STATES' },
    interests: ['math', 'calculus', 'physics'],
    subjects: ['mathematics', 'calculus'],
    skills: ['limits', 'derivatives', 'integrals'],
    joinDate: Date.now(),
  },
  {
    id: 'course_eng101',
    code: 'ENG101',
    title: 'ENG101 Writing I',
    department: 'English',
    credits: 3,
    yearOfStudy: 1,
    level: 1,
    program: 'General Studies',
    bio: 'Academic writing and composition.',
    location: { campus: 'Main', city: 'Campus', country: 'UNITED STATES' },
    interests: ['writing', 'communication', 'literature'],
    subjects: ['english', 'writing'],
    skills: ['essay writing', 'research', 'grammar'],
    joinDate: Date.now(),
  },
  {
    id: 'course_phy101',
    code: 'PHY101',
    title: 'PHY101 Physics I',
    department: 'Physics',
    credits: 4,
    yearOfStudy: 1,
    level: 1,
    program: 'BSc Computer Science',
    bio: 'Classical mechanics and motion.',
    location: { campus: 'Main', city: 'Campus', country: 'UNITED STATES' },
    interests: ['physics', 'mechanics', 'science'],
    subjects: ['physics', 'mechanics'],
    skills: ['mechanics', 'motion', 'energy'],
    joinDate: Date.now(),
  },
];

export const CourseList: React.FC = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const raw = localStorage.getItem('unipulse_courses');
      if (!raw) {
        localStorage.setItem('unipulse_courses', JSON.stringify(DEFAULT_COURSES));
        return DEFAULT_COURSES;
      }
      const parsed = JSON.parse(raw) as Course[];
      return parsed.length ? parsed : DEFAULT_COURSES;
    } catch { return DEFAULT_COURSES; }
  });

  const [loading, setLoading] = useState(false);

  const seedIfEmpty = () => {
    const existing = getAllCourses();
    if (!existing.length) {
      saveCourses(DEFAULT_COURSES);
      setCourses(DEFAULT_COURSES);
    }
  };

  const handleAdd = async (code: string) => {
    if (!user) return;
    setLoading(true);
    const newCourse: Course = {
      id: `course_${Date.now()}_${code}`,
      code,
      title: COURSE_LABELS[code] ?? code.toUpperCase(),
      department: 'Computer Science',
      credits: 3,
      yearOfStudy: 11,
      level: 1,
      program: 'Programming',
      bio: '',
      location: { campus: 'Main', city: 'Campus', country: 'UNITED STATES' },
      interests: [],
      subjects: [],
      skills: [],
      joinDate: Date.now(),
    };
    await addCourse(newCourse);
    setCourses((prev) => [...prev, newCourse]);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setLoading(true);
    await deleteCourse(id);
    setCourses((prev) => prev.filter(c => c.id !== id));
    setLoading(false);
  };

  seedIfEmpty();

  return (
    <ThemeProvider>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">University Curriculum</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Browse, add, and manage courses across departments.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading curriculum…</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm uppercase tracking-wider mb-4">No courses found.</p>
            <button
              onClick={() => handleAdd('CS101')}
              className="btn-primary px-5 py-2 rounded-md bg-[#00843D] text-white hover:bg-[#004E7A] transition-colors"
            >
              Add CS101
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <div key={course.id} className="border rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-[#00843D] bg-[#00843D]/10 px-2 py-0.5 rounded">{course.code}</span>
                  {course.level && <span className="text-xs font-medium text-slate-400">Level {course.level}</span>}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {course.department} • {course.credits} credits
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{course.bio || 'No description.'}</p>
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleAdd(course.code)}
                    className="flex-1 px-3 py-2 text-sm font-medium bg-[#00843D] text-white rounded hover:bg-[#004E7A] transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Adding…' : 'Enroll'}
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded hover:text-red-900 transition-colors"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default CourseList;
