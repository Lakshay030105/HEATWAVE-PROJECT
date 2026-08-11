// ============================================================================
// AlertLog.js — Mongoose Model for Alert Dispatch Logs
// Owner: Member 1 (Backend Lead)
// When to build: Day 2
// ============================================================================
//
// PURPOSE:
//   Records every alert that was sent (or attempted). Critical for:
//   - Preventing duplicate alerts (dedupeKey)
//   - Showing alert history on the dashboard
//   - Debugging why an alert did or didn't fire
//
// SCHEMA FIELDS:
//   wardId:         String, required
//   tier:           String, required, enum: ["Severe", "Extreme"]
//   channel:        String, required, enum: ["sms", "voice", "push"]
//   recipientPhone: String            (masked in API responses for privacy)
//   sentAt:         Date, default: Date.now
//   dedupeKey:      String, required, unique  (format: "${wardId}-${date}-${tier}")
//   status:         String, enum: ["sent", "failed", "skipped"], default: "sent"
//
// DEDUPE LOGIC:
//   Before sending an alert, the riskWatcher checks:
//     AlertLog.findOne({ dedupeKey: `${wardId}-${today}-${tier}` })
//   If a doc exists → skip (already alerted today for this ward+tier)
//   If no doc → send alert, then create AlertLog entry
//
//   This prevents the alert from firing every 30 seconds when the cron
//   re-checks and finds the same Severe/Extreme risk still there.
//
// REFERENCE:
//   See docs/API_CONTRACTS.md → "alertlogs" collection
//
// ============================================================================

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