const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  wardId: {
    type: String,
    required: true,
  },
  reportType: {
    type: String,
    required: true,
    enum: ['heat_illness', 'infrastructure_issue', 'general'],
  },
  description: {
    type: String,
    maxlength: 500,
  },
  severity: {
    type: String,
    required: true,
    enum: ['mild', 'moderate', 'severe'],
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
  contactPhone: {
    type: String,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
