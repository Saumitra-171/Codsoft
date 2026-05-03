const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'projectflow_secret_2024';

router.post('/register', async (req, res) => {
  const { name, email, password, avatar } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password required' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const avatars = ['🦁','🐯','🦊','🐺','🦝','🐻','🐼','🦋','🦅','🦜'];
    const userAvatar = avatar || avatars[Math.floor(Math.random() * avatars.length)];

    const result = await pool.query(
      'INSERT INTO users (name, email, password, avatar) VALUES ($1,$2,$3,$4) RETURNING id,name,email,avatar',
      [name, email, hash, userAvatar]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id,name,email,avatar,created_at FROM users WHERE id=$1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
