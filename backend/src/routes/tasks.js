/**
 * AcademiaIQ Task Routes
 * CRUD for user tasks
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for user (protected)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, priority, limit = 100, offset = 0 } = req.query;

    let query = `SELECT * FROM tasks WHERE user_id = ?`;
    const params = [req.user.userId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND priority = ?`;
      params.push(priority);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const tasks = db.prepare(query).all(...params);
    res.json({ tasks });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task (protected)
router.post('/', authenticateToken, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('due_date').optional(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description = '', due_date = null, priority = 'medium' } = req.body;

  try {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    db.prepare(
      `INSERT INTO tasks (id, user_id, title, description, due_date, priority) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, req.user.userId, title, description, due_date, priority);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(201).json({ task });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task (protected)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('due_date').optional(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'in-progress', 'done']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, due_date, priority, status } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(id, req.user.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = [];
    const values = [];
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (due_date !== undefined) { updates.push('due_date = ?'); values.push(due_date); }
    if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));
    values.push(id, req.user.userId);

    db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json({ task });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task (protected)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, req.user.userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get task stats (protected)
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = db.prepare(
      `SELECT status, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY status`
    ).all(req.user.userId);

    const total = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?').get(req.user.userId).count;

    res.json({ total, byStatus: stats });
  } catch (err) {
    console.error('Task stats error:', err);
    res.status(500).json({ error: 'Failed to fetch task stats' });
  }
});

export default router;
