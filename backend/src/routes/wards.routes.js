// ============================================================================
// wards.routes.js — Ward Data Endpoints
// Owner: Member 1 (Backend Lead)
// When to build: Day 2
// ============================================================================
//
// PURPOSE:
//   Serve ward data to the frontend. The map component (HeatMap.jsx) calls
//   GET /api/wards on load to fetch all wards with their boundaries and
//   latest risk tier.
//
// ENDPOINTS TO BUILD:
//
//   GET /api/wards
//   - Returns all wards with their latest DailyRisk joined in
//   - The frontend needs: wardId, name, boundary (GeoJSON), population,
//     pctElderly, pctOutdoorWorkers, greenCoverPct, AND the latest riskTier
//   - Use Mongoose populate or an aggregation pipeline to join Ward + DailyRisk
//   - Response: { success: true, data: [...wards] }
//
//   GET /api/wards/:wardId
//   - Returns a single ward with full details and latest risk
//   - Used by CitizenView.jsx when user selects a ward
//   - Response: { success: true, data: { ...ward, latestRisk: {...} } }
//
// JOINING WARD + RISK:
//   Option A — Aggregation (recommended):
//     Ward.aggregate([
//       { $lookup: { from: 'dailyrisks', localField: 'wardId', foreignField: 'wardId', as: 'risks' } },
//       { $addFields: { latestRisk: { $last: '$risks' } } },
//       { $project: { risks: 0 } }
//     ])
//
//   Option B — Two queries:
//     const wards = await Ward.find();
//     const latestRisks = await DailyRisk.find({ date: today }).lean();
//     // merge in memory
//
// CONTROLLER:
//   Business logic goes in controllers/wardController.js
//   This file just defines routes and connects them to controller functions
//
// ============================================================================

const express = require('express');
const router = express.Router();

// Import the controller we built earlier
const wardController = require('../controllers/wardController');

// Route 1: GET /api/wards -> Fetches all wards (maps to getAllWards in controller)
router.get('/', wardController.getAllWards);

// Route 2: GET /api/wards/:wardId -> Fetches a single ward by ID
router.get('/:wardId', wardController.getWardById);

module.exports = router;