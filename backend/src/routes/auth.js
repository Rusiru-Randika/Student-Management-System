const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
