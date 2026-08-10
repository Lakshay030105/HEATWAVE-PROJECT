// ============================================================================
// DailyRisk.js — Mongoose Model for Daily Risk Assessments
// Owner: Member 1 (Backend Lead)
// When to build: Day 1
// ============================================================================
//
// PURPOSE:
//   Stores the daily computed risk tier for each ward.
//   Written by the AI service (risk_fusion.py) and read by:
//   - Express API (served to frontend)
//   - riskWatcher.cron.js (checks for Severe/Extreme to fire alerts)
//   - simulate.routes.js (writes simulated entries for demo)
//
// SCHEMA FIELDS:
//   wardId:           String, required     (references wards.wardId)
//   date:             String, required     (ISO date "2026-08-10")
//   hvi:              Number, required     (0-100 vulnerability index)
//   forecastTempC:    Number               (max temperature forecast)
//   forecastHumidity: Number               (max relative humidity %)
//   riskTier:         String, required, enum: ["Low", "Moderate", "Severe", "Extreme"]
//   computedAt:       Date, default: Date.now
//   isSimulated:      Boolean, default: false  (true when set via simulation toggle)
//
// INDEXES:
//   - Compound index on { wardId, date } — unique (one risk per ward per day)
//   - Index on { riskTier } — the cron watcher queries by this
//   - Index on { date } — for fetching latest risks
//
// IMPORTANT:
//   The simulate endpoint (POST /api/simulate) creates DailyRisk docs with
//   isSimulated: true. The watcher treats them the same as real ones.
//   This is what makes the demo button work.
//
// REFERENCE:
//   See docs/API_CONTRACTS.md → "dailyrisks" collection
//
// ============================================================================
