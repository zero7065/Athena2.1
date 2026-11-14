/**
 * AcademiaIQ Skills Routes
 * CRUD for user skill progress
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all skills for user (protected)
router.get('/', authenticateToken, (req, res) => {
  try {
    const skills = db.prepare(
      `SELECT * FROM skills WHERE user_id = ? ORDER BY category, name`
    ).all(req.user.userId);
    res.json({ skills });
  } catch (err) {
    console.error('Get skills error:', err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Update skill XP (protected)
router.post('/:id/xp', authenticateToken, [
  body('xp_gain').isInt({ min: 1, max: 1000 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { xp_gain } = req.body;

  try {
    const skill = db.prepare('SELECT * FROM skills WHERE id = ? AND user_id = ?').get(id, req.user.userId);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    let newXp = skill.xp + xp_gain;
    let newLevel = skill.level;
    let leveledUp = false;

    while (newXp >= 100 && newLevel < 5) {
      newXp -= 100;
      newLevel += 1;
      leveledUp = true;
    }

    const now = Math.floor(Date.now() / 1000);

    db.prepare(
      `UPDATE skills SET level = ?, xp = ?, last_practiced = ? WHERE id = ? AND user_id = ?`
    ).run(newLevel, newXp, now, id, req.user.userId);

    const updated = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
    res.json({
      skill: updated,
      leveledUp,
      newLevel,
    });
  } catch (err) {
    console.error('Update skill XP error:', err);
    res.status(500).json({ error: 'Failed to update skill XP' });
  }
});

// Seed default skills for user (protected)
router.post('/seed', authenticateToken, (req, res) => {
  try {
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

    const insert = db.prepare(
      `INSERT OR IGNORE INTO skills (user_id, name, category, level, xp) VALUES (?, ?, ?, ?, ?)`
    );

    for (const [name, category, level, xp] of defaultSkills) {
      insert.run(req.user.userId, name, category, level, xp);
    }

    const skills = db.prepare(
      `SELECT * FROM skills WHERE user_id = ? ORDER BY category, name`
    ).all(req.user.userId);

    res.json({ skills, seeded: defaultSkills.length });
  } catch (err) {
    console.error('Seed skills error:', err);
    res.status(500).json({ error: 'Failed to seed skills' });
  }
});

export default router;
