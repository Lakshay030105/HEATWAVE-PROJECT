
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

// Trial accounts must use predefined template names as `body` if custom SMS is restricted by Twilio trial policy.
// See: https://www.twilio.com/docs/usage/trials/try-out-sms
const TRIAL_SMS_TEMPLATES = {
  Severe: 'sms_account_alerts',
  Extreme: 'sms_internal_alerts',
  Moderate: 'sms_account_alerts',
  Low: 'sms_account_alerts',
};

exports.sendSMS = async (phoneNumber, wardNameOrMessage, riskTier, advisory, customMessage) => {
  try {
    if (!phoneNumber) {
      return { success: false, error: 'No recipient phone number configured' };
    }

    // Determine the SMS body to send
    let bodyText = '';
    if (customMessage) {
      bodyText = customMessage;
    } else if (riskTier && advisory) {
      bodyText = `[AAROGYA HEAT ALERT] ⚠️ ${wardNameOrMessage}: ${riskTier} Risk! ${advisory} Stay hydrated, avoid midday sun & seek cooling centers.`;
    } else if (typeof wardNameOrMessage === 'string' && wardNameOrMessage.trim().length > 0) {
      bodyText = wardNameOrMessage;
    } else {
      bodyText = 'HEAT ALERT: High heatwave risk advisory issued. Stay hydrated and seek shelter.';
    }

    const trialTemplate = TRIAL_SMS_TEMPLATES[riskTier] || process.env.TWILIO_SMS_TEMPLATE || 'sms_internal_alerts';

    if (!client) {
      console.log(`[MOCK TWILIO SMS] -> To: ${phoneNumber} | Body: ${bodyText}`);
      return { success: true, sid: `mock_sms_${Date.now()}` };
    }

    let message;
    try {
      // 1. Try sending the full informative custom message
      message = await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
        body: bodyText,
      });
    } catch (sendErr) {
      // 2. If Twilio trial account requires predefined template (Code 572006), dispatch trial template
      if (sendErr.code === 572006 || (sendErr.message && sendErr.message.includes('predefined SMS templates'))) {
        console.log(`ℹ️ Twilio trial account restriction detected (Code 572006). Sending trial template '${trialTemplate}' to ${phoneNumber}...`);
        message = await client.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
          body: trialTemplate,
        });
      } else {
        throw sendErr;
      }
    }

    console.log(`✅ Alert SMS successfully sent to ${phoneNumber}. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error(`❌ Twilio SMS Error for ${phoneNumber}:`, error.message);
    return { success: false, error: error.message };
  }
};

exports.sendWhatsApp = async (phoneNumber, wardNameOrMessage, riskTier, advisory, customMessage) => {
  try {
    if (!phoneNumber) {
      return { success: false, error: 'No recipient phone number configured' };
    }

    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    const to = cleanPhone.startsWith('whatsapp:') ? cleanPhone : `whatsapp:${cleanPhone}`;
    const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    let bodyText = '';
    if (customMessage) {
      bodyText = `🚨 *[AAROGYA HEATWAVE BROADCAST]* 🚨\n\n${customMessage}\n\n_Aarogya Early Warning & Heat Response Network_`;
    } else if (riskTier && advisory) {
      bodyText = `🚨 *[AAROGYA HEAT ALERT]* 🚨\n\n📍 *Ward:* ${wardNameOrMessage}\n⚠️ *Risk Tier:* *${riskTier.toUpperCase()}*\n📢 *Advisory:* ${advisory}\n💧 *Action:* Drink ORS/water, avoid direct sun between 11:00 AM – 4:00 PM, and seek the nearest municipal cooling center.\n\n_Aarogya Urban Heat Action Network_`;
    } else if (typeof wardNameOrMessage === 'string') {
      bodyText = `🚨 *[AAROGYA HEAT ALERT]* 🚨\n\n${wardNameOrMessage}\n\n_Aarogya Urban Heat Action Network_`;
    } else {
      bodyText = `🚨 *[AAROGYA HEAT ALERT]* 🚨\n\nHigh heatwave risk advisory issued for Jaipur. Please stay hydrated and seek cooling centers.`;
    }

    if (!client) {
      console.log(`[MOCK TWILIO WHATSAPP] -> To: ${to} | Body: ${bodyText}`);
      return { success: true, sid: `mock_wa_${Date.now()}` };
    }

    const message = await client.messages.create({
      from,
      to,
      body: bodyText,
    });

    console.log(`✅ WhatsApp Alert successfully sent to ${to}. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error(`❌ Twilio WhatsApp Error for ${phoneNumber}:`, error.message);
    return { success: false, error: error.message };
  }
};