// ============================================================================
// server.js — Express Application Entry Point
// Owner: Member 1 (Backend Lead)
// When to build: Day 1
// ============================================================================
//
// PURPOSE:
//   Create and configure the Express server. This file ties together all
//   routes, middleware, database connection, and the cron watcher.
//
// WHAT TO BUILD:
//
//   1. Import and configure:
//      - express
//      - cors (allow frontend at localhost:5173 and deployed URL)
//      - dotenv (load .env file)
//      - The database connection from config/db.js
//
//   2. Set up middleware:
//      - express.json() for parsing JSON request bodies
//      - cors() with allowed origins
//      - The error handler from middleware/errorHandler.js
//
//   3. Mount all route files:
//      - app.use('/api/wards', wardsRoutes)
//      - app.use('/api', riskRoutes)         // /api/wards/:wardId/risk, /api/risk/latest
//      - app.use('/api/alerts', alertsRoutes)
//      - app.use('/api/resources', resourcesRoutes)
//      - app.use('/api/simulate', simulateRoutes)
//      - app.use('/api/feedback', feedbackRoutes)  // if you add a feedback route
//
//   4. Start the cron watcher:
//      - Import and call startWatcher() from jobs/riskWatcher.cron.js
//      - This runs alongside the Express server in the same process
//
//   5. Connect to MongoDB and start listening:
//      - Call connectDB() from config/db.js
//      - Listen on PORT from .env (default 5000)
//      - Log: "🚀 Backend running on port ${PORT}"
//
// EXAMPLE STRUCTURE:
//   const express = require('express');
//   const cors = require('cors');
//   require('dotenv').config();
//   const connectDB = require('./config/db');
//   const { startWatcher } = require('./jobs/riskWatcher.cron');
//
//   const app = express();
//   app.use(cors());
//   app.use(express.json());
//
//   // Routes
//   app.use('/api/wards', require('./routes/wards.routes'));
//   // ... mount other routes
//
//   // Start
//   connectDB().then(() => {
//     startWatcher();
//     app.listen(process.env.PORT || 5000);
//   });
//
// ============================================================================
