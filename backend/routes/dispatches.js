const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET /api/dispatches
router.get('/', (req, res) => {
  try {
    const dispatches = db.prepare(`
      SELECT d.*, i.title as incidentTitle, r.name as resourceName 
      FROM dispatches d
      JOIN incidents i ON d.incidentId = i.id
      JOIN resources r ON d.resourceId = r.id
      ORDER BY d.dispatchedAt DESC
    `).all();
    res.json(dispatches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve dispatches' });
  }
});

// POST /api/dispatches
router.post('/', (req, res) => {
  try {
    const { incidentId, resourceId, estimatedArrival, route, notes } = req.body;
    
    if (!incidentId || !resourceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = db.transaction(() => {
      // 1. Check resource
      const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
      if (!resource) throw new Error('Resource not found');
      if (resource.status !== 'Available') throw new Error('Resource is currently unavailable');

      // 2. Check incident
      const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(incidentId);
      if (!incident) throw new Error('Incident not found');
      if (incident.status === 'Resolved') throw new Error('Incident is already resolved');

      // 3. Create dispatch record
      const dispatchId = `DSP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      db.prepare(`
        INSERT INTO dispatches (id, incidentId, resourceId, estimatedArrival, route, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(dispatchId, incidentId, resourceId, estimatedArrival || null, route ? JSON.stringify(route) : null, notes || '');

      // 4. Update resource
      db.prepare('UPDATE resources SET status = ?, assignedIncident = ? WHERE id = ?')
        .run('Dispatched', incidentId, resourceId);

      // 5. Update incident
      db.prepare('UPDATE incidents SET status = ?, assignedResource = ? WHERE id = ?')
        .run('Dispatched', resourceId, incidentId);

      return dispatchId;
    });

    const newDispatchId = transaction();
    const newDispatch = db.prepare('SELECT * FROM dispatches WHERE id = ?').get(newDispatchId);
    
    res.status(201).json({
      success: true,
      message: 'Resource dispatched successfully',
      dispatch: newDispatch
    });

  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('unavailable') || error.message.includes('resolved')) {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to dispatch resource' });
  }
});

// PUT /api/dispatches/:id (e.g. mark arrived or completed)
router.put('/:id', (req, res) => {
  try {
    const { status, notes } = req.body;

    const current = db
      .prepare('SELECT * FROM dispatches WHERE id = ?')
      .get(req.params.id);

    if (!current) {
      return res.status(404).json({
        error: 'Dispatch not found'
      });
    }

    const newStatus = status || current.status;

    const transaction = db.transaction(() => {

      // Update dispatch
      db.prepare(`
        UPDATE dispatches
        SET status = ?, notes = ?
        WHERE id = ?
      `).run(
        newStatus,
        notes !== undefined ? notes : current.notes,
        req.params.id
      );

      // ON ROUTE
      if (newStatus === 'On Route') {

        db.prepare(`
          UPDATE incidents
          SET status = ?
          WHERE id = ?
        `).run(
          'On Route',
          current.incidentId
        );

        db.prepare(`
          UPDATE resources
          SET status = ?
          WHERE id = ?
        `).run(
          'On Route',
          current.resourceId
        );
      }

      // ARRIVED
      if (newStatus === 'Arrived') {

        db.prepare(`
          UPDATE incidents
          SET status = ?
          WHERE id = ?
        `).run(
          'On Scene',
          current.incidentId
        );

        db.prepare(`
          UPDATE resources
          SET status = ?
          WHERE id = ?
        `).run(
          'On Scene',
          current.resourceId
        );
      }

      // RESOLVED
      if (
        newStatus === 'Resolved' ||
        newStatus === 'Completed'
      ) {

        db.prepare(`
          UPDATE incidents
          SET status = ?,
              assignedResource = NULL
          WHERE id = ?
        `).run(
          'Resolved',
          current.incidentId
        );

        db.prepare(`
          UPDATE resources
          SET status = ?,
              assignedIncident = NULL
          WHERE id = ?
        `).run(
          'Available',
          current.resourceId
        );
      }
    });

    transaction();

    const updatedDispatch = db
      .prepare(`
        SELECT
          d.*,
          i.title as incidentTitle,
          r.name as resourceName
        FROM dispatches d
        JOIN incidents i
          ON d.incidentId = i.id
        JOIN resources r
          ON d.resourceId = r.id
        WHERE d.id = ?
      `)
      .get(req.params.id);

    res.json({
      success: true,
      message: `Dispatch status updated to ${newStatus}`,
      dispatch: updatedDispatch
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to update dispatch'
    });
  }
});
module.exports = router;
