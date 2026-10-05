require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes will be imported here
const incidentsRouter = require('./routes/incidents');
const resourcesRouter = require('./routes/resources');
const roadsRouter = require('./routes/roads');
const dispatchesRouter = require('./routes/dispatches');
const dashboardRouter = require('./routes/dashboard');

app.use('/api/incidents', incidentsRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/roads', roadsRouter);
app.use('/api/dispatches', dispatchesRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SMART-ERS Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
