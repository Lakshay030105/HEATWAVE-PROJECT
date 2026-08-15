
const cron = require('node-cron');

// Adjust the relative import paths below if your project structure differs
const DailyRisk = require('../models/DailyRisk');
const AlertLog = require('../models/AlertLog');
const Ward = require('../models/Ward');
const twilioService = require('../services/twilioService');
// const firebaseService = require('../services/firebaseService'); // Uncomment if Firebase push notifications are enabled

// Demo recipient phone numbers (verified Twilio trial numbers from .env or fallback for local demo)
const DEMO_RECIPIENTS = [
  process.env.MY_PHONE_NUMBER,
  process.env.DEMO_RECIPIENT,
  '+917082744636'
].filter(Boolean);

// Advisory text mappings based on risk tier
const ADVISORY_MESSAGES = {
  Severe: 'High heat risk. Limit outdoor activity. Stay hydrated.',
  Extreme: 'EXTREME heat danger. Seek nearest cooling center immediately.'
};

/**
 * Core alert dispatch logic
 */
async function checkAndAlert() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const highRisks = await DailyRisk.find({
        date: today,
        riskTier: { $in: ['Severe', 'Extreme'] }
      });
  
      for (const risk of highRisks) {
        const ward = await Ward.findOne({ wardId: risk.wardId });
        if (!ward) continue;
  
        const advisory = ADVISORY_MESSAGES[risk.riskTier] || 'Heat risk advisory issued.';
  
        // LOOP THROUGH EACH PERSON
        for (const recipientPhone of DEMO_RECIPIENTS) {
          
          // THE FIX: Include the phone number in the dedupeKey so it is 100% unique!
          const dedupeKey = `${risk.wardId}-${today}-${risk.riskTier}-${recipientPhone}`;
          
          // Now check if THIS specific person already got the text today
          const existing = await AlertLog.findOne({ dedupeKey });
          if (existing) {
            continue; // Skip this person, they already got the alert
          }
  
          // Send SMS via Twilio
          const alertMessage = `[AAROGYA HEAT ALERT] ⚠️ ${ward.name}: ${risk.riskTier} Risk! ${advisory}`;
          const smsResult = await twilioService.sendSMS(
            recipientPhone,
            ward.name,
            risk.riskTier,
            advisory,
            alertMessage
          );

          if (!smsResult.success) {
            console.error(`Failed to send alert to ${recipientPhone}: ${smsResult.error}`);
            continue; // Skip logging so the watcher retries on the next cycle
          }

          // Log the alert in MongoDB only after Twilio confirms success
          await AlertLog.create({
            wardId: risk.wardId,
            tier: risk.riskTier,
            channel: 'sms',
            message: alertMessage,
            recipientPhone: recipientPhone,
            sentAt: new Date(),
            dedupeKey: dedupeKey,
            status: 'sent'
          });

          console.log(`Alert sent and logged: ${ward.name} -> ${risk.riskTier} for ${recipientPhone}`);
        }
      }
    } catch (error) {
      console.error('Error in risk watcher background job:', error);
    }
  }

function startWatcher() {
  cron.schedule('*/30 * * * * *', checkAndAlert);
  console.log('Risk watcher started (checking every 30 seconds)');
}

module.exports = {
  startWatcher,
  checkAndAlert
};