
const mongoose = require('mongoose');

const alertLogSchema = new mongoose.Schema({
  wardId: { 
    type: String, 
    required: true 
  },
  tier: { 
    type: String, 
    required: true, 
    enum: ['Severe', 'Extreme'] 
  },
  channel: { 
    type: String, 
    required: true, 
    enum: ['sms', 'voice', 'push'] 
  },
  recipientPhone: { 
    type: String // The masking mentioned in the comments is handled later in the API route, not the database schema.
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  dedupeKey: { 
    type: String, 
    required: true, 
    unique: true 
  },
  status: { 
    type: String, 
    enum: ['sent', 'failed', 'skipped'], 
    default: 'sent' 
  }
});

module.exports = mongoose.model('AlertLog', alertLogSchema);