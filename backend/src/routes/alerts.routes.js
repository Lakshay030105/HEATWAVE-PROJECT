
const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// Route 1: GET /api/alerts -> Fetches recent sent alerts (handles optional ?wardId query)
router.get('/', alertController.getAlerts);

// Route 2: POST /api/alerts -> Record and dispatch a new broadcast alert
router.post('/', alertController.createAlert);

module.exports = router;