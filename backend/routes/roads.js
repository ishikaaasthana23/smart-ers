const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/roads
router.get('/', (req, res) => {
  try {
    const roads = db.prepare('SELECT id, from_node as "from", to_node as "to", distance, time, status FROM roads').all();
    res.json(roads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve roads' });
  }
});

// GET /api/roads/:id
router.get('/:id', (req, res) => {
  try {
    const road = db.prepare('SELECT id, from_node as "from", to_node as "to", distance, time, status FROM roads WHERE id = ?').get(req.params.id);
    if (!road) return res.status(404).json({ error: 'Road not found' });
    res.json(road);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve road' });
  }
});

// PUT /api/roads/:id
router.put('/:id', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const info = db.prepare('UPDATE roads SET status = ? WHERE id = ?').run(status, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Road not found' });

    const updatedRoad = db.prepare('SELECT id, from_node as "from", to_node as "to", distance, time, status FROM roads WHERE id = ?').get(req.params.id);
    res.json(updatedRoad);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update road' });
  }
});

module.exports = router;
