const cron = require('node-cron');

const DailyRisk = require('../models/DailyRisk');
const AlertLog = require('../models/AlertLog');
const Ward = require('../models/Ward');
const twilioService = require('../services/twilioService');
const { normalizePhoneNumber } = require('../utils/phoneUtils');

// Demo recipient phone numbers (verified Twilio trial numbers from .env)
const getRecipients = () => {
  const list = [
    process.env.MY_PHONE_NUMBER,
    process.env.DEMO_RECIPIENT,
  ].filter(Boolean);

  const normalized = list
    .map(phone => normalizePhoneNumber(phone))
    .filter(Boolean);

  // Remove duplicates
  return Array.from(new Set(normalized));
};

// Advisory text mappings based on risk tier
const ADVISORY_MESSAGES = {
  Severe: 'High heat risk. Limit outdoor activity. Stay hydrated.',
  Extreme: 'EXTREME heat danger. Seek nearest cooling center immediately.'
};

/**
 * Core alert dispatch logic executed on background cron schedule
 */
async function checkAndAlert() {
  try {
    const recipients = getRecipients();
    if (recipients.length === 0) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const highRisks = await DailyRisk.find({
      date: today,
      riskTier: { $in: ['Severe', 'Extreme'] }
    }).lean();

    for (const risk of highRisks) {
      const ward = await Ward.findOne({ wardId: risk.wardId }).lean();
      if (!ward) continue;

      const advisory = ADVISORY_MESSAGES[risk.riskTier] || 'Heat risk advisory issued.';

      // Loop through each verified recipient
      for (const recipientPhone of recipients) {
        // Unique daily dedupeKey per ward, date, tier, and phone
        const dedupeKey = `${risk.wardId}-${today}-${risk.riskTier}-${recipientPhone}`;

        // Check if this recipient already received this alert today
        const existing = await AlertLog.findOne({ dedupeKey }).lean();
        if (existing) {
          continue; // Skip, already handled today
        }

        // Send SMS via Twilio
        const alertMessage = `[AAROGYA HEAT ALERT] ${ward.name}: ${risk.riskTier} Risk! ${advisory}`;
        const smsResult = await twilioService.sendSMS(
          recipientPhone,
          ward.name,
          risk.riskTier,
          advisory,
          alertMessage
        );

        const status = (smsResult && smsResult.success) ? 'sent' : 'failed';

        // Log the alert in MongoDB (with status) so dedupe prevents repeated 30-second error loops
        await AlertLog.create({
          wardId: risk.wardId,
          tier: risk.riskTier,
          channel: 'sms',
          message: alertMessage,
          recipientPhone: recipientPhone,
          sentAt: new Date(),
          dedupeKey: dedupeKey,
          status: status
        });

        if (status === 'sent') {
          console.log(`[CRON] Alert sent and logged: ${ward.name} -> ${risk.riskTier} for ${recipientPhone}`);
        } else {
          console.warn(`[CRON] Alert failed for ${recipientPhone}: ${smsResult?.error || 'Unknown error'}`);
        }
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