
const express = require('express');
const router = express.Router();

// Import the controller we built earlier
const resourceController = require('../controllers/resourceController');

// Route 1: GET /api/resources -> Fetches all resources (handles query params)
router.get('/', resourceController.getResources);

// Route 2: PUT /api/resources/:id -> Updates a specific resource (occupancy/status)
router.put('/:id', resourceController.updateResource);

module.exports = router;