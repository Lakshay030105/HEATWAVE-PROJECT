
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