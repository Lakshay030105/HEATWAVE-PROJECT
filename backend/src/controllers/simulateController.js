// ============================================================================
// simulateController.js — Business Logic for Simulation Toggle
// Owner: Member 1 (Backend Lead)
// When to build: Day 2-3
// ============================================================================
//
// WHAT TO BUILD:
//
//   1. exports.simulateHeatwave = async (req, res) => { ... }
//      - Read wardId and tier from req.body
//      - Validate: wardId must exist in wards collection
//      - Validate: tier must be "Low" | "Moderate" | "Severe" | "Extreme"
//      - Upsert a DailyRisk document for today:
//        DailyRisk.findOneAndUpdate(
//          { wardId, date: today },
//          { $set: { riskTier: tier, hvi: 95, isSimulated: true, ... } },
//          { upsert: true, new: true }
//        )
//      - Return { success: true, wardId, tier }
//
// THIS IS THE DEMO BUTTON BACKEND:
//   The riskWatcher.cron.js will detect this new Extreme/Severe tier
//   on its next poll cycle (every 30 seconds) and fire SMS/push alerts.
//   The frontend will refetch ward data and recolor the map.
//
// ============================================================================
