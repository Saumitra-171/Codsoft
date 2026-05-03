const router = require('express').Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');

// Get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id=$1
      ORDER BY t.created_at ASC
    `, [req.params.projectId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await pool.query(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id
      WHERE t.id=$1
    `, [req.params.id]);
    if (!task.rows.length) return res.status(404).json({ error: 'Task not found' });

    const comments = await pool.query(`
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM comments c JOIN users u ON c.user_id=u.id
      WHERE c.task_id=$1 ORDER BY c.created_at ASC
    `, [req.params.id]);

    res.json({ ...task.rows[0], comments: comments.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  const { title, description, status, priority, project_id, assignee_id, deadline } = req.body;
  if (!title || !project_id) return res.status(400).json({ error: 'Title and project_id required' });

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title,description,status,priority,project_id,assignee_id,deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, status || 'todo', priority || 'medium', project_id, assignee_id || null, deadline || null]
    );

    const task = await pool.query(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id
      WHERE t.id=$1
    `, [result.rows[0].id]);

    res.status(201).json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  const { title, description, status, priority, assignee_id, deadline } = req.body;
  try {
    await pool.query(
      `UPDATE tasks SET title=COALESCE($1,title), description=COALESCE($2,description),
       status=COALESCE($3,status), priority=COALESCE($4,priority),
       assignee_id=CASE WHEN $5::text IS NOT NULL THEN $5::uuid ELSE assignee_id END,
       deadline=COALESCE($6,deadline), updated_at=NOW() WHERE id=$7`,
      [title, description, status, priority, assignee_id, deadline, req.params.id]
    );

    const task = await pool.query(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id WHERE t.id=$1
    `, [req.params.id]);

    res.json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  try {
    const result = await pool.query(
      `INSERT INTO comments (content,task_id,user_id) VALUES ($1,$2,$3) RETURNING *`,
      [content, req.params.id, req.user.id]
    );
    const comment = await pool.query(
      `SELECT c.*, u.name as user_name, u.avatar as user_avatar
       FROM comments c JOIN users u ON c.user_id=u.id WHERE c.id=$1`,
      [result.rows[0].id]
    );
    res.status(201).json(comment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my tasks
router.get('/my/assigned', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as project_name, p.color as project_color
      FROM tasks t
      JOIN projects p ON t.project_id=p.id
      WHERE t.assignee_id=$1
      ORDER BY t.deadline ASC NULLS LAST, t.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
