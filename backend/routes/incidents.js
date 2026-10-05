const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET /api/incidents
router.get('/', (req, res) => {
  try {
    const incidents = db.prepare('SELECT * FROM incidents ORDER BY reportedAt DESC').all();
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve incidents' });
  }
});

// GET /api/incidents/:id
router.get('/:id', (req, res) => {
  try {
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve incident' });
  }
});

// POST /api/incidents
router.post('/', (req, res) => {
  try {
    const { title, type, severity, location, description } = req.body;
    if (!title || !type || !severity || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = `INC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const status = 'Active';

    const insert = db.prepare(`
      INSERT INTO incidents (id, title, type, severity, location, description, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(id, title, type, severity, location, description || '', status);
    
    const newIncident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
    res.status(201).json(newIncident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// PUT /api/incidents/:id
router.put('/:id', (req, res) => {
  try {
    const { status, title, type, severity, location, description, assignedResource } = req.body;
    
    const current = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    if (!current) return res.status(404).json({ error: 'Incident not found' });

    const updated = {
      ...current,
      ...(status && { status }),
      ...(title && { title }),
      ...(type && { type }),
      ...(severity && { severity }),
      ...(location && { location }),
      ...(description !== undefined && { description }),
      ...(assignedResource !== undefined && { assignedResource })
    };

    db.prepare(`
      UPDATE incidents 
      SET status = ?, title = ?, type = ?, severity = ?, location = ?, description = ?, assignedResource = ?
      WHERE id = ?
    `).run(
      updated.status, updated.title, updated.type, updated.severity, 
      updated.location, updated.description, updated.assignedResource, req.params.id
    );

    const updatedIncident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    res.json(updatedIncident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// DELETE /api/incidents/:id
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM incidents WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Incident not found' });
    res.json({ success: true, message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete incident' });
  }
});

module.exports = router;
