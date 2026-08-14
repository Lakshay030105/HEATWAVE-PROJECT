
const mongoose = require('mongoose');

const alertLogSchema = new mongoose.Schema({
  wardId: { 
    type: String, 
    required: true 
  },
  tier: { 
    type: String, 
    required: true, 
    enum: ['Low', 'Moderate', 'Severe', 'Extreme'] 
  },
  channel: { 
    type: String, 
    required: true, 
    enum: ['sms', 'voice', 'push'] 
  },
  message: {
    type: String
  },
  recipientCount: {
    type: Number,
    default: 1
  },
  recipientPhone: { 
    type: String
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  dedupeKey: { 
    type: String, 
    sparse: true 
  },
  status: { 
    type: String, 
    enum: ['sent', 'failed', 'skipped'], 
    default: 'sent' 
  }
});

module.exports = mongoose.model('AlertLog', alertLogSchema);