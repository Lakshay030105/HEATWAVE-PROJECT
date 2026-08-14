// ============================================================================
// risk.routes.js — Risk Data Endpoints
// Owner: Member 1 (Backend Lead)
// When to build: Day 2
// ============================================================================
//
// PURPOSE:
//   Serve risk history and latest risk data. Used by the dashboard for
//   trend charts and by the map for current ward coloring.
//
// ENDPOINTS TO BUILD:
//
//   GET /api/wards/:wardId/risk
//   - Returns risk history for a specific ward (array of DailyRisk docs)
//   - Sort by date descending, limit to last 30 entries
//   - Used by Dashboard.jsx for the temperature trend line chart
//   - Response: { success: true, data: [...dailyRisks] }
//
//   GET /api/risk/latest
//   - Returns the latest DailyRisk for ALL wards (today's snapshot)
//   - Used by the map to color-code wards by current risk tier
//   - Group by wardId, take the most recent doc for each
//   - Response: { success: true, data: [...latestRisks] }
//
// CONTROLLER:
//   Business logic in controllers/riskController.js
//
// ============================================================================


const express = require('express');
const router = express.Router();

// Import the controller we built earlier
const riskController = require('../controllers/riskController');

// Route 1: GET /history/:wardId -> Fetches 30-day risk history for a specific ward
// (This connects to the dashboard's trend line chart)
router.get('/history/:wardId', riskController.getRiskHistory);

// Route 2: GET /latest -> Fetches the newest document for all wards
// (This connects to the map for color-coding)
router.get('/latest', riskController.getLatestRisks);

// POST /api/risk/recompute -> proxies to the AI service, which writes dailyrisks
router.post('/recompute', riskController.recomputeRisk);

module.exports = router;