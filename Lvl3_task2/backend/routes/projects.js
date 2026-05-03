const router = require('express').Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name as owner_name,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.status='done' THEN t.id END) as done_tasks,
        COUNT(DISTINCT pm.user_id) as member_count
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.owner_id=$1 OR pm.user_id=$1
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const proj = await pool.query(`
      SELECT p.*, u.name as owner_name, u.avatar as owner_avatar
      FROM projects p JOIN users u ON p.owner_id=u.id
      WHERE p.id=$1
    `, [req.params.id]);
    if (!proj.rows.length) return res.status(404).json({ error: 'Project not found' });

    const members = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar, pm.role
      FROM project_members pm JOIN users u ON pm.user_id=u.id
      WHERE pm.project_id=$1
    `, [req.params.id]);

    res.json({ ...proj.rows[0], members: members.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  const { name, description, color, deadline } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name required' });

  try {
    const result = await pool.query(
      'INSERT INTO projects (name,description,color,deadline,owner_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, description, color || '#6366f1', deadline || null, req.user.id]
    );
    // Add owner as member
    await pool.query(
      'INSERT INTO project_members (project_id,user_id,role) VALUES ($1,$2,$3)',
      [result.rows[0].id, req.user.id, 'owner']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  const { name, description, color, deadline, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE projects SET name=COALESCE($1,name), description=COALESCE($2,description),
       color=COALESCE($3,color), deadline=COALESCE($4,deadline), status=COALESCE($5,status),
       updated_at=NOW() WHERE id=$6 AND owner_id=$7 RETURNING *`,
      [name, description, color, deadline, status, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id=$1 AND owner_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member
router.post('/:id/members', auth, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query('SELECT id,name,email,avatar FROM users WHERE email=$1', [email]);
    if (!user.rows.length) return res.status(404).json({ error: 'User not found' });
    await pool.query(
      'INSERT INTO project_members (project_id,user_id,role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      [req.params.id, user.rows[0].id, 'member']
    );
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get project stats
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status='todo' THEN 1 END) as todo,
        COUNT(CASE WHEN status='in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status='review' THEN 1 END) as review,
        COUNT(CASE WHEN status='done' THEN 1 END) as done,
        COUNT(CASE WHEN deadline < NOW() AND status != 'done' THEN 1 END) as overdue
      FROM tasks WHERE project_id=$1
    `, [req.params.id]);
    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
