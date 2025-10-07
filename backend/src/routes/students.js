const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

/**
 * Students Router
 *
 * Best practices:
 *  - Validate and coerce query/body params
 *  - Use parameterized SQL only (prevent SQL injection)
 *  - Return structured, predictable JSON
 */

const router = express.Router();

// GET /api/students (search + pagination)
router.get('/', verifyToken, async (req, res, next) => {
  const search = typeof req.query.search === 'string' ? req.query.search : '';
  const page = Number.parseInt(req.query.page, 10) > 0 ? Number.parseInt(req.query.page, 10) : 1;
  const limit = Number.parseInt(req.query.limit, 10) > 0 ? Number.parseInt(req.query.limit, 10) : 10;
  const offset = (page - 1) * limit;

  try {
    const studentsResult = await db.query(
      'SELECT * FROM students WHERE name ILIKE $1 AND is_active = true ORDER BY id DESC LIMIT $2 OFFSET $3',
      [`%${search}%`, limit, offset]
    );
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM students WHERE name ILIKE $1 AND is_active = true',
      [`%${search}%`]
    );

    res.json({
      students: studentsResult.rows,
      pagination: {
        total: Number.parseInt(countResult.rows[0].total, 10),
        page,
        limit,
        totalPages: Math.ceil(Number.parseInt(countResult.rows[0].total, 10) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/students/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid student id' });
  }
  try {
    const result = await db.query('SELECT * FROM students WHERE id = $1 AND is_active = true', [id]);
    const student = result.rows[0];
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
});

// POST /api/students
router.post('/', verifyToken, async (req, res, next) => {
  const { name, email, phone, course, enrolment_date } = req.body;
  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO students (name, email, phone, course, enrolment_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, phone, course, enrolment_date]
    );
    res.status(201).json({ id: result.rows[0].id, name, email, phone, course, enrolment_date });
  } catch (error) {
    next(error);
  }
});

// PUT /api/students/:id
router.put('/:id', verifyToken, async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  const { name, email, phone, course, enrolment_date } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid student id' });
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const result = await db.query(
      'UPDATE students SET name = $1, email = $2, phone = $3, course = $4, enrolment_date = $5 WHERE id = $6',
      [name, email, phone, course, enrolment_date, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/students/:id (soft delete)
router.delete('/:id', verifyToken, async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid student id' });
  }
  try {
    const result = await db.query('UPDATE students SET is_active = false WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
