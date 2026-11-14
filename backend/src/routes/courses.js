/**
 * AcademiaIQ Courses Routes
 * Course catalog management
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all courses (protected)
router.get('/', authenticateToken, (req, res) => {
  try {
    const courses = db.prepare('SELECT * FROM courses ORDER BY code').all();
    res.json({ courses });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create course (protected - lecturer/admin/management)
router.post('/', authenticateToken, [
  body('code').trim().notEmpty(),
  body('title').trim().notEmpty(),
  body('department').optional().trim(),
  body('credits').optional().isInt({ min: 1, max: 10 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!['lecturer', 'admin', 'management'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only lecturers and admins can create courses' });
  }

  const { code, title, department = '', credits = 3, year_of_study = 1, level = 1, program = '', bio = '', location = '{}', interests = '[]', subjects = '[]', skills = '[]' } = req.body;

  try {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    db.prepare(
      `INSERT INTO courses (id, code, title, department, credits, year_of_study, level, program, bio, location, interests, subjects, skills, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, code, title, department, credits, year_of_study, level, program, bio, location, interests, subjects, skills, now);

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    res.status(201).json({ course });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

export default router;
