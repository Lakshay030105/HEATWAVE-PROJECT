const express = require('express');
const router = express.Router();

// Import the controller we built earlier
const wardController = require('../controllers/wardController');
const riskController = require('../controllers/riskController');

// Route 1: GET /api/wards -> Fetches all wards (maps to getAllWards in controller)
router.get('/', wardController.getAllWards);

// Route 2: GET /api/wards/:wardId/risk -> Risk history (must be before /:wardId)
router.get('/:wardId/risk', riskController.getRiskHistory);

// Route 3: GET /api/wards/:wardId -> Fetches a single ward by ID
router.get('/:wardId', wardController.getWardById);

module.exports = router;