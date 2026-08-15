
const Ward = require('../models/Ward');
const DailyRisk = require('../models/DailyRisk');
const AlertLog = require('../models/AlertLog');
const twilioService = require('../services/twilioService');

// Advisory text mappings based on risk tier
const ADVISORY_MESSAGES = {
  Severe: 'High heat risk. Limit outdoor activity. Stay hydrated.',
  Extreme: 'EXTREME heat danger. Seek nearest cooling center immediately.'
};

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
    const forecastTemp = tier === 'Extreme' ? 47.5 : tier === 'Severe' ? 44.0 : 39.0;
    const hviScore = tier === 'Extreme' ? 95 : tier === 'Severe' ? 82 : 55;

    // Upsert the DailyRisk document
    const simulatedRisk = await DailyRisk.findOneAndUpdate(
      { wardId: wardId, date: todayStr },
      { 
        $set: { 
          riskTier: tier, 
          hvi: hviScore,
          isSimulated: true,
          forecastTempC: forecastTemp,
          forecastHumidity: 20,
          computedAt: new Date()
        } 
      },
      { upsert: true, new: true }
    );

    // If Severe or Extreme heat spike, immediately dispatch SMS alert to verified phone number
    let smsResult = null;
    if (tier === 'Severe' || tier === 'Extreme') {
      const recipientPhone = process.env.MY_PHONE_NUMBER || '+918607405507';
      const advisory = ADVISORY_MESSAGES[tier] || 'High heatwave risk advisory.';
      const alertMessage = `[AAROGYA HEAT ALERT] ⚠️ ${wardExists.name}: ${tier} Risk (${forecastTemp}°C)! ${advisory}`;

      smsResult = await twilioService.sendSMS(
        recipientPhone,
        wardExists.name,
        tier,
        advisory,
        alertMessage
      );

      // Log the alert in MongoDB
      await AlertLog.create({
        wardId: wardId,
        tier: tier,
        channel: 'sms',
        message: alertMessage,
        recipientPhone: recipientPhone,
        sentAt: new Date(),
        dedupeKey: `sim-${wardId}-${Date.now()}`,
        status: smsResult.success ? 'sent' : 'failed'
      });

      console.log(`🚀 Simulated Heat Spike Alert dispatched for ${wardExists.name} (${tier}) to ${recipientPhone}`);
    }

    res.status(200).json({ 
      success: true, 
      wardId, 
      tier, 
      message: "Simulation active & alert SMS dispatched",
      smsResult
    });

  } catch (err) {
    console.error("Error simulating heatwave:", err);
    if (next) return next(err);
    res.status(500).json({ success: false, message: "Server error during simulation" });
  }
};