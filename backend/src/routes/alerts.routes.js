// ============================================================================
// alerts.routes.js — Alert Log Endpoints
// Owner: Member 1 (Backend Lead)
// When to build: Day 2-3
// ============================================================================
//
// PURPOSE:
//   Serve alert dispatch history to the dashboard. Shows authorities
//   which alerts were sent, when, and to which wards.
//
// ENDPOINTS TO BUILD:
//
//   GET /api/alerts
//   - Returns recent alert logs, sorted by sentAt descending
//   - Default limit: 50 entries
//   - Optional query param: ?wardId=AHM-W03 to filter by ward
//   - Response: { success: true, data: [...alertLogs] }
//
// NOTE:
//   AlertLog docs are CREATED by riskWatcher.cron.js, not by this route.
//   This route only READS them for the dashboard display.
//
// CONTROLLER:
//   Business logic in controllers/alertController.js
//
// ============================================================================


const express = require('express');
const router = express.Router();

// Import the controller we built earlier
const alertController = require('../controllers/alertController');

// Route 1: GET /api/alerts -> Fetches recent sent alerts (handles optional ?wardId query)
router.get('/', alertController.getAlerts);

module.exports = router;