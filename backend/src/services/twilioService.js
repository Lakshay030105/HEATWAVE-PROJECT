
require('dotenv').config();
const twilio = require('twilio');

let client = null;
const sid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_API_KEY_SID;
const token = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_API_KEY_SECRET;

if (sid && token) {
  try {
    if (sid.startsWith('SK') && process.env.TWILIO_MAIN_ACCOUNT_SID) {
      client = twilio(sid, token, { accountSid: process.env.TWILIO_MAIN_ACCOUNT_SID });
    } else {
      client = twilio(sid, token);
    }
  } catch (err) {
    console.warn("⚠️ Twilio initialization notice:", err.message);
  }
}

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

    if (!client) {
      console.log(`[MOCK TWILIO SMS] -> To: ${phoneNumber} | Ward: ${wardName} | Tier: ${riskTier} | Advisory: ${advisory}`);
      return { success: true, sid: `mock_sms_${Date.now()}` };
    }

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