const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  try {
    const stats = {};

    stats.totalIncidents = db.prepare('SELECT COUNT(*) as count FROM incidents').get().count;
    stats.activeIncidents = db.prepare('SELECT COUNT(*) as count FROM incidents WHERE status != ?').get('Resolved').count;
    stats.criticalIncidents = db.prepare('SELECT COUNT(*) as count FROM incidents WHERE severity = ? AND status != ?').get('Critical', 'Resolved').count;
    stats.resolvedIncidents = db.prepare('SELECT COUNT(*) as count FROM incidents WHERE status = ?').get('Resolved').count;

    stats.totalResources = db.prepare('SELECT COUNT(*) as count FROM resources').get().count;
    stats.availableResources = db.prepare('SELECT COUNT(*) as count FROM resources WHERE status = ?').get('Available').count;
    stats.occupiedResources = db.prepare('SELECT COUNT(*) as count FROM resources WHERE status != ? AND status != ?').get('Available', 'Offline').count;

    stats.blockedRoads = db.prepare('SELECT COUNT(*) as count FROM roads WHERE status != ?').get('Open').count;
    stats.activeDispatches = db.prepare('SELECT COUNT(*) as count FROM dispatches WHERE status = ?').get('Active').count;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
});

module.exports = router;
