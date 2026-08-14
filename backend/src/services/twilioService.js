// ============================================================================
// twilioService.js — Twilio SMS & Voice Alert Dispatch
// Owner: Member 1 (Backend Lead)
// When to build: Day 3
// ============================================================================
//
// PURPOSE:
//   Send SMS (and optionally voice) alerts to registered phone numbers
//   when a ward reaches Severe or Extreme risk tier.
//
// WHAT TO BUILD:
//
//   1. Initialize the Twilio client:
//      const twilio = require('twilio');
//      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
//
//   2. exports.sendSMS = async (phoneNumber, wardName, riskTier, advisory) => { ... }
//      - Use client.messages.create({
//          body: `⚠️ HEAT ALERT: ${wardName} is at ${riskTier} risk. ${advisory}. Stay hydrated, seek shade.`,
//          from: process.env.TWILIO_PHONE_NUMBER,
//          to: phoneNumber
//        })
//      - Return { success: true, sid: message.sid }
//      - Handle errors: log and return { success: false, error: ... }
//
//   3. (STRETCH) exports.sendVoiceCall = async (phoneNumber, wardName, riskTier) => { ... }
//      - Use client.calls.create() with a TwiML voice message
//      - Only build this if SMS is fully working and Day 4 has time
//
// TWILIO TRIAL ACCOUNT RULES:
//   ⚠️ Trial accounts can ONLY send SMS to VERIFIED phone numbers.
//   - Go to Twilio Console → Verified Caller IDs → add your team's phones
//   - Do this on Day 1 or Day 2, NOT right before the demo
//   - Trial messages are prefixed with "Sent from your Twilio trial account"
//     (this is fine for the demo — mention it's a trial if judges notice)
//
// CALLED BY:
//   - riskWatcher.cron.js (when it detects Severe/Extreme risk)
//
// DEPENDENCIES:
//   - twilio npm package (already in package.json)
//   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER from .env
//
// ============================================================================


require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Trial accounts must use predefined template names as `body` (not custom text).
// See: https://www.twilio.com/docs/usage/trials/try-out-sms
const TRIAL_SMS_TEMPLATES = {
  Severe: 'sms_account_alerts',
  Extreme: 'sms_internal_alerts',
};

exports.sendSMS = async (phoneNumber, wardName, riskTier, advisory) => {
  try {
    if (!phoneNumber) {
      return { success: false, error: 'No recipient phone number configured' };
    }

    const customBody = `HEAT ALERT: ${wardName} is at ${riskTier} risk. ${advisory}. Stay hydrated, seek shade.`;
    const trialBody = process.env.TWILIO_SMS_TEMPLATE || TRIAL_SMS_TEMPLATES[riskTier] || 'sms_internal_alerts';

    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      // Trial accounts require template names; set TWILIO_USE_CUSTOM_SMS=true after upgrading
      body: process.env.TWILIO_USE_CUSTOM_SMS === 'true' ? customBody : trialBody,
    });

    console.log(`Alert SMS sent to ${phoneNumber}. SID: ${message.sid}`);

    return { success: true, sid: message.sid };
  } catch (error) {
    console.error(`Twilio SMS Error for ${phoneNumber}:`, error.message);

    return { success: false, error: error.message };
  }
};