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

const mongoose = require('mongoose');

const dailyRiskSchema = new mongoose.Schema({
  wardId: { 
    type: String, 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  hvi: { 
    type: Number, 
    required: true 
  },
  forecastTempC: { 
    type: Number 
  },
  forecastHumidity: { 
    type: Number 
  },
  riskTier: { 
    type: String, 
    required: true, 
    enum: ['Low', 'Moderate', 'Severe', 'Extreme'] 
  },
  computedAt: { 
    type: Date, 
    default: Date.now 
  },
  isSimulated: { 
    type: Boolean, 
    default: false 
  }
});

// INDEXES (As requested in lines 25-27)
// 1. Compound unique index to ensure only one risk assessment per ward per day
dailyRiskSchema.index({ wardId: 1, date: 1 }, { unique: true });
// 2. Index for the cron watcher to quickly find Extreme/Severe risks
dailyRiskSchema.index({ riskTier: 1 });
// 3. Index for quickly fetching the latest dates
dailyRiskSchema.index({ date: -1 });

module.exports = mongoose.model('DailyRisk', dailyRiskSchema);