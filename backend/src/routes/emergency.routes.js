const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// GET /api/emergency/units
router.get('/units', emergencyController.getUnits);

// POST /api/emergency/dispatch
router.post('/dispatch', emergencyController.dispatchUnit);

module.exports = router;
