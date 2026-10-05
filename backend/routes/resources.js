const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/resources
router.get('/', (req, res) => {
  try {
    const resources = db.prepare('SELECT * FROM resources').all();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve resources' });
  }
});

// GET /api/resources/:id
router.get('/:id', (req, res) => {
  try {
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve resource' });
  }
});

// POST /api/resources
router.post('/', (req, res) => {
  try {
    const { id, name, type, location, capacity } = req.body;
    if (!id || !name || !type || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const status = 'Available';

    const insert = db.prepare(`
      INSERT INTO resources (id, name, type, status, location, capacity) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(id, name, type, status, location, capacity || null);
    
    const newResource = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    res.status(201).json(newResource);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Resource ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// PUT /api/resources/:id
router.put('/:id', (req, res) => {
  try {
    const { status, name, type, location, capacity, assignedIncident } = req.body;
    
    const current = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!current) return res.status(404).json({ error: 'Resource not found' });

    const updated = {
      ...current,
      ...(status && { status }),
      ...(name && { name }),
      ...(type && { type }),
      ...(location && { location }),
      ...(capacity !== undefined && { capacity }),
      ...(assignedIncident !== undefined && { assignedIncident })
    };

    db.prepare(`
      UPDATE resources 
      SET status = ?, name = ?, type = ?, location = ?, capacity = ?, assignedIncident = ?
      WHERE id = ?
    `).run(
      updated.status, updated.name, updated.type, updated.location, 
      updated.capacity, updated.assignedIncident, req.params.id
    );

    const updatedResource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    res.json(updatedResource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// DELETE /api/resources/:id
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Resource not found' });
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

module.exports = router;
