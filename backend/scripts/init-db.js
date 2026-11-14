/**
 * AcademiaIQ Database Initialization
 * Creates all tables and seeds default data
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../data/academiaiq.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

function init() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student' CHECK (role IN ('student', 'lecturer', 'admin', 'management')),
      department TEXT,
      student_id TEXT,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      theme_color TEXT DEFAULT '#00843D',
      font_preference TEXT DEFAULT 'sans',
      ai_personality TEXT DEFAULT 'charming',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Study sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      duration INTEGER DEFAULT 0,
      focus_score INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Skills table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
      xp INTEGER DEFAULT 0 CHECK (xp BETWEEN 0 AND 99),
      last_practiced INTEGER,
      UNIQUE(user_id, name)
    );
  `);

  // Submissions table (lecturer-student)
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lecturer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      assignment_title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded')),
      score INTEGER DEFAULT 0,
      feedback TEXT DEFAULT '',
      submitted_at INTEGER,
      graded_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      lecturer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT,
      points INTEGER DEFAULT 100,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      department TEXT DEFAULT '',
      credits INTEGER DEFAULT 3,
      year_of_study INTEGER DEFAULT 1,
      level INTEGER DEFAULT 1,
      program TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      location TEXT DEFAULT '{}',
      interests TEXT DEFAULT '[]',
      subjects TEXT DEFAULT '[]',
      skills TEXT DEFAULT '[]',
      join_date INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Content resources table
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_resources (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      type TEXT DEFAULT 'note' CHECK (type IN ('note', 'pdf', 'link', 'video', 'slides')),
      url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      created_by TEXT DEFAULT '',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Syllabi table
  db.exec(`
    CREATE TABLE IF NOT EXISTS syllabi (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      course TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      instructor TEXT NOT NULL,
      objectives TEXT DEFAULT '[]',
      modules TEXT DEFAULT '[]',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Game scores table
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_scores (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      chess INTEGER DEFAULT 0,
      memory INTEGER DEFAULT 0,
      sudoku INTEGER DEFAULT 0,
      art_guesser INTEGER DEFAULT 0,
      cbt_exam INTEGER DEFAULT 0,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_lecturer_id ON assignments(lecturer_id);
    CREATE INDEX IF NOT EXISTS idx_content_resources_subject ON content_resources(subject);
  `);

  // Seed default users
  const users = db.prepare(
    `INSERT OR IGNORE INTO users (email, password_hash, name, role, department, student_id, xp) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  users.run('admin@unipulse.io', hash('admin123'), 'Admin User', 'admin', 'Administration', 'ADM001', 0);
  users.run('lecturer@unipulse.io', hash('lecturer123'), 'Lecturer User', 'lecturer', 'Computer Science', 'LEC001', 0);
  users.run('student@unipulse.io', hash('student123'), 'Student User', 'student', 'Computer Science', 'STU001', 0);

  // Seed default content resources
  const resources = db.prepare(
    `INSERT OR IGNORE INTO content_resources (title, subject, type, url, description, tags, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const defaultResources = [
    ['MDN Web Docs', 'Computer Science', 'link', 'https://developer.mozilla.org', 'Web development documentation', '["html","css","javascript"]', 'AcademiaIQ'],
    ['freeCodeCamp', 'Computer Science', 'link', 'https://www.freecodecamp.org', 'Free coding curriculum', '["javascript","python","web-dev"]', 'AcademiaIQ'],
    ['Khan Academy - Math', 'Mathematics', 'link', 'https://www.khanacademy.org/math', 'Math lessons', '["math","algebra","calculus"]', 'AcademiaIQ'],
    ['Khan Academy - Physics', 'Physics', 'link', 'https://www.khanacademy.org/science/physics', 'Physics lessons', '["physics","mechanics"]', 'AcademiaIQ'],
    ['Khan Academy - Chemistry', 'Chemistry', 'link', 'https://www.khanacademy.org/science/chemistry', 'Chemistry lessons', '["chemistry"]', 'AcademiaIQ'],
    ['Khan Academy - Biology', 'Biology', 'link', 'https://www.khanacademy.org/science/biology', 'Biology lessons', '["biology"]', 'AcademiaIQ'],
    ['Purdue OWL', 'English', 'link', 'https://owl.purdue.edu', 'Writing and citation resources', '["writing","citation"]', 'AcademiaIQ'],
    ['MIT OpenCourseWare', 'Computer Science', 'link', 'https://ocw.mit.edu', 'MIT course materials', '["mit","courseware","cs"]', 'AcademiaIQ'],
    ['Coursera', 'Computer Science', 'link', 'https://www.coursera.org', 'Online courses', '["coursera","online-learning"]', 'AcademiaIQ'],
    ['edX', 'Mathematics', 'link', 'https://www.edx.org', 'University courses', '["edx","university"]', 'AcademiaIQ'],
  ];

  for (const r of defaultResources) {
    resources.run(...r);
  }

  // Seed default skills
  const skills = db.prepare(
    `INSERT OR IGNORE INTO skills (user_id, name, category, level, xp) VALUES (?, ?, ?, ?, ?)`
  );

  const defaultSkills = [
    ['JavaScript', 'Programming', 1, 0],
    ['TypeScript', 'Programming', 1, 0],
    ['React', 'Programming', 1, 0],
    ['CSS & Styling', 'Programming', 1, 0],
    ['Git & Version Control', 'Tools', 1, 0],
    ['Calculus', 'Mathematics', 1, 0],
    ['Algebra', 'Mathematics', 1, 0],
    ['Classical Mechanics', 'Physics', 1, 0],
    ['Energy & Thermodynamics', 'Physics', 1, 0],
    ['Chemical Bonding', 'Chemistry', 1, 0],
    ['Genetics', 'Biology', 1, 0],
    ['Ecology', 'Biology', 1, 0],
    ['Academic Writing', 'Communication', 1, 0],
    ['Research Methods', 'Communication', 1, 0],
    ['Citation Styles (APA/MLA)', 'Communication', 1, 0],
  ];

  // Get student user id
  const studentRow = db.prepare('SELECT id FROM users WHERE email = ?').get('student@unipulse.io');
  if (studentRow) {
    const studentId = studentRow.id;
    for (const [name, category, level, xp] of defaultSkills) {
      skills.run(studentId, name, category, level, xp);
    }
  }

  console.log('✅ Database initialized successfully');
  console.log('📍 Database path:', DB_PATH);
  console.log('👤 Default users:');
  console.log('   admin@unipulse.io / admin123 (admin)');
  console.log('   lecturer@unipulse.io / lecturer123 (lecturer)');
  console.log('   student@unipulse.io / student123 (student)');

  db.close();
}

init();
