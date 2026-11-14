/**
 * AcademiaIQ Auth Routes
 * Register, login, logout, profile
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../utils/db.js';
import { authenticateToken, generateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').optional().isIn(['student', 'lecturer', 'admin', 'management']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, role = 'student', department, student_id } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, department, student_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, email, passwordHash, name, role, department || null, student_id || null);

    const token = generateToken({ id, email, name, role });
    res.status(201).json({
      token,
      user: { id, email, name, role, department, student_id },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        student_id: user.student_id,
        xp: user.xp,
        streak: user.streak,
        theme_color: user.theme_color,
        font_preference: user.font_preference,
        ai_personality: user.ai_personality,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Get profile (protected)
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(
      `SELECT id, email, name, role, department, student_id, xp, streak, theme_color, font_preference, ai_personality FROM users WHERE id = ?`
    ).get(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile (protected)
router.put('/profile', authenticateToken, [
  body('name').optional().trim().notEmpty(),
  body('department').optional().trim(),
  body('theme_color').optional(),
  body('font_preference').optional().isIn(['sans', 'mono', 'serif']),
  body('ai_personality').optional().isIn(['charming', 'strict', 'sarcastic', 'zen']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, department, theme_color, font_preference, ai_personality } = req.body;

  try {
    const updates = [];
    const values = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (department !== undefined) { updates.push('department = ?'); values.push(department); }
    if (theme_color !== undefined) { updates.push('theme_color = ?'); values.push(theme_color); }
    if (font_preference !== undefined) { updates.push('font_preference = ?'); values.push(font_preference); }
    if (ai_personality !== undefined) { updates.push('ai_personality = ?'); values.push(ai_personality); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));
    values.push(req.user.userId);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const user = db.prepare(
      `SELECT id, email, name, role, department, student_id, xp, streak, theme_color, font_preference, ai_personality FROM users WHERE id = ?`
    ).get(req.user.userId);

    res.json({ user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
