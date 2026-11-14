/**
 * AcademiaIQ Submissions Routes
 * Lecturer-student submission management
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get submissions for student (protected)
router.get('/student', authenticateToken, (req, res) => {
  try {
    const submissions = db.prepare(
      `SELECT s.*, u.name as lecturer_name FROM submissions s
       LEFT JOIN users u ON s.lecturer_id = u.id
       WHERE s.student_id = ? ORDER BY s.created_at DESC`
    ).all(req.user.userId);
    res.json({ submissions });
  } catch (err) {
    console.error('Get student submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get submissions for lecturer (protected)
router.get('/lecturer', authenticateToken, (req, res) => {
  try {
    // Lecturers see submissions for their assignments or all submissions
    const submissions = db.prepare(
      `SELECT s.*, u.name as student_name, u.email as student_email FROM submissions s
       LEFT JOIN users u ON s.student_id = u.id
       ORDER BY s.created_at DESC`
    ).all();
    res.json({ submissions });
  } catch (err) {
    console.error('Get lecturer submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Create submission (protected)
router.post('/', authenticateToken, [
  body('assignment_title').trim().notEmpty(),
  body('description').optional().trim(),
  body('status').optional().isIn(['draft', 'submitted', 'graded']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { assignment_title, description = '', status = 'draft' } = req.body;

  try {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    db.prepare(
      `INSERT INTO submissions (id, student_id, assignment_title, description, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, req.user.userId, assignment_title, description, status, status === 'submitted' ? now : null);

    const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    res.status(201).json({ submission });
  } catch (err) {
    console.error('Create submission error:', err);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Grade submission (protected - lecturer/admin only)
router.post('/:id/grade', authenticateToken, [
  body('score').isInt({ min: 0, max: 100 }),
  body('feedback').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { score, feedback = '' } = req.body;

  // Only lecturer, admin, or management can grade
  if (!['lecturer', 'admin', 'management'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only lecturers and admins can grade submissions' });
  }

  try {
    const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const now = Math.floor(Date.now() / 1000);

    db.prepare(
      `UPDATE submissions SET status = 'graded', score = ?, feedback = ?, lecturer_id = ?, graded_at = ? WHERE id = ?`
    ).run(score, feedback, req.user.userId, now, id);

    const updated = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    res.json({ submission: updated });
  } catch (err) {
    console.error('Grade submission error:', err);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

// Get submission stats (protected)
router.get('/stats', authenticateToken, (req, res) => {
  try {
    let stats;
    if (req.user.role === 'student') {
      stats = db.prepare(
        `SELECT status, COUNT(*) as count FROM submissions WHERE student_id = ? GROUP BY status`
      ).all(req.user.userId);
    } else {
      stats = db.prepare(
        `SELECT status, COUNT(*) as count FROM submissions GROUP BY status`
      ).all();
    }
    res.json({ byStatus: stats });
  } catch (err) {
    console.error('Submission stats error:', err);
    res.status(500).json({ error: 'Failed to fetch submission stats' });
  }
});

export default router;
