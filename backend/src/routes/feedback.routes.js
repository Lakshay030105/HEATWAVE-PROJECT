const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// GET /api/feedback -> Fetch all citizen reports (feed)
router.get('/', feedbackController.getFeedback);

// POST /api/feedback -> Submit a new citizen report
router.post('/', feedbackController.submitFeedback);

// PUT /api/feedback/:id -> Update report status or resolution
router.put('/:id', feedbackController.updateFeedback);

module.exports = router;

