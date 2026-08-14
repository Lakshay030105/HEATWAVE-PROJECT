const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  wardId: {
    type: String,
    required: true,
  },
  reportType: {
    type: String,
    required: true,
    enum: ['heat_illness', 'infrastructure_issue', 'general', 'water_shortage'],
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
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved'],
    default: 'pending',
  },
  location: {
    type: String,
    default: '',
  },
  resolutionNote: {
    type: String,
    default: '',
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

