
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