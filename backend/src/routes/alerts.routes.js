
const express = require('express');
const router = express.Router();

// Import the controller we built earlier
const alertController = require('../controllers/alertController');

// Route 1: GET /api/alerts -> Fetches recent sent alerts (handles optional ?wardId query)
router.get('/', alertController.getAlerts);

module.exports = router;