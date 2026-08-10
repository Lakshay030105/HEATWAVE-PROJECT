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
