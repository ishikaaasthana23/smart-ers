const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Initialize database schema
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roads (
      id TEXT PRIMARY KEY,
      from_node TEXT NOT NULL,
      to_node TEXT NOT NULL,
      distance REAL,
      time INTEGER NOT NULL,
      status TEXT DEFAULT 'Open'
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'Available',
      location TEXT NOT NULL,
      capacity INTEGER,
      assignedIncident TEXT
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Active',
      reportedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      assignedResource TEXT
    );

    CREATE TABLE IF NOT EXISTS dispatches (
      id TEXT PRIMARY KEY,
      incidentId TEXT NOT NULL,
      resourceId TEXT NOT NULL,
      dispatchedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Active',
      estimatedArrival INTEGER,
      route TEXT,
      notes TEXT,
      FOREIGN KEY (incidentId) REFERENCES incidents (id),
      FOREIGN KEY (resourceId) REFERENCES resources (id)
    );
  `);

  // Seed Data if empty
  const roadCount = db.prepare('SELECT COUNT(*) as count FROM roads').get().count;
  if (roadCount === 0) {
    const insertRoad = db.prepare('INSERT INTO roads (id, from_node, to_node, time, status) VALUES (?, ?, ?, ?, ?)');
    insertRoad.run('R1', 'H1', 'J1', 4, 'Open');
    insertRoad.run('R2', 'J1', 'J2', 3, 'Open');
    insertRoad.run('R3', 'H1', 'J3', 5, 'Open');
    insertRoad.run('R4', 'J3', 'J2', 6, 'Open');
    insertRoad.run('R5', 'J2', 'H2', 2, 'Open');
    insertRoad.run('R6', 'S1', 'J2', 4, 'Open');
  }

  const resourceCount = db.prepare('SELECT COUNT(*) as count FROM resources').get().count;
  if (resourceCount === 0) {
    const insertResource = db.prepare('INSERT INTO resources (id, name, type, status, location) VALUES (?, ?, ?, ?, ?)');
    insertResource.run('AMB-101', 'BLS Ambulance', 'Ambulance', 'Available', 'H1');
    insertResource.run('AMB-102', 'ALS / Trauma Ambulance', 'Ambulance', 'Available', 'H2');
    insertResource.run('FE-201', 'Fire Engine 1', 'Fire Truck', 'Available', 'S1');
    insertResource.run('PV-301', 'Police Patrol', 'Police Vehicle', 'Available', 'J1');
  }

  const incidentCount = db.prepare('SELECT COUNT(*) as count FROM incidents').get().count;
  if (incidentCount === 0) {
    const insertIncident = db.prepare('INSERT INTO incidents (id, title, type, severity, location, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertIncident.run('INC-001', 'Multi-car collision', 'Accident', 'Critical', 'J2', 'Two cars collided at junction J2.', 'Active');
    insertIncident.run('INC-002', 'Building fire', 'Fire', 'High', 'J3', 'Smoke reported from a residential building.', 'Active');
  }
}

initDb();

module.exports = db;
