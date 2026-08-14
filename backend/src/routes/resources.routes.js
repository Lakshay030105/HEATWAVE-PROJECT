// ============================================================================
// resources.routes.js — Cooling Center & Resource Endpoints
// Owner: Member 1 (Backend Lead)
// When to build: Day 2-3
// ============================================================================
//
// PURPOSE:
//   CRUD for cooling centers, water stations, and medical camps.
//   The dashboard shows a bar chart of capacity vs. occupancy.
//   The citizen page shows nearest cooling center for a selected ward.
//
// ENDPOINTS TO BUILD:
//
//   GET /api/resources
//   - Returns all resources
//   - Optional query param: ?type=cooling_center to filter by type
//   - Optional query param: ?wardId=AHM-W03 to filter by ward
//   - Response: { success: true, data: [...resources] }
//
//   PUT /api/resources/:id
//   - Update a resource (mainly for updating currentOccupancy and status)
//   - Used by authorities to mark a cooling center as "full" or "closed"
//   - Body: { currentOccupancy: 45, status: "open" }
//   - Response: { success: true, data: { ...updatedResource } }
//
// NOTE:
//   Resources are seeded by scripts/seed-db.js with realistic sample data.
//   For the demo, pre-seed 2-3 cooling centers per ward.
//
// CONTROLLER:
//   Business logic in controllers/resourceController.js
//
// ============================================================================


const express = require('express');
const router = express.Router();

// Import the controller we built earlier
const resourceController = require('../controllers/resourceController');

// Route 1: GET /api/resources -> Fetches all resources (handles query params)
router.get('/', resourceController.getResources);

// Route 2: PUT /api/resources/:id -> Updates a specific resource (occupancy/status)
router.put('/:id', resourceController.updateResource);

module.exports = router;