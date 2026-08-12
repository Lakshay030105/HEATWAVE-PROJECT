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


const Ward = require('../models/Ward');
const DailyRisk = require('../models/DailyRisk');

// 1. Manually trigger a heatwave simulation for a specific ward
exports.simulateHeatwave = async (req, res, next) => {
  try {
    const { wardId, tier } = req.body;

    // Validate 1: Tier must be one of the allowed enums
    const validTiers = ['Low', 'Moderate', 'Severe', 'Extreme'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ success: false, message: "Invalid tier provided" });
    }

    // Validate 2: Ward must actually exist in the database
    const wardExists = await Ward.findOne({ wardId: wardId }).lean();
    if (!wardExists) {
      return res.status(404).json({ success: false, message: "Ward not found" });
    }

    // Format today's date exactly as "YYYY-MM-DD" to match your DailyRisk schema
    const todayStr = new Date().toISOString().split('T')[0];

    // Upsert the DailyRisk document
    const simulatedRisk = await DailyRisk.findOneAndUpdate(
      { wardId: wardId, date: todayStr }, // The search criteria
      { 
        $set: { 
          riskTier: tier, 
          hvi: 95, // High default HVI for the simulation
          isSimulated: true,
          forecastTempC: 45, // Dummy weather data for the demo
          forecastHumidity: 20
        } 
      },
      { upsert: true, new: true } // upsert creates it if missing, new returns the updated doc
    );

    // Return the exact success object requested on line 19
    res.status(200).json({ 
      success: true, 
      wardId, 
      tier, 
      message: "Simulation active" 
    });

  } catch (err) {
    console.error("Error simulating heatwave:", err);
    res.status(500).json({ success: false, message: "Server error during simulation" });
    if (next) next(err);
  }
};