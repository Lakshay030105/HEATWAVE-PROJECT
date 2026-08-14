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

module.exports = router;