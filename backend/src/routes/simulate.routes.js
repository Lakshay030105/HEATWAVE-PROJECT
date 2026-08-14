const express = require('express');
const router = express.Router();

// Import the controller we built earlier
const simulateController = require('../controllers/simulateController');

// Route 1: POST /api/simulate -> Triggers the demo simulation
router.post('/', simulateController.simulateHeatwave);

module.exports = router;