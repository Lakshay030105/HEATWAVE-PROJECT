require('dotenv').config();
const twilio = require('twilio');
const { normalizePhoneNumber } = require('../utils/phoneUtils');

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

/**
 * Dispatch an SMS Alert via Twilio (with automatic normalization & trial fallback)
 */
exports.sendSMS = async (phoneNumber, wardNameOrMessage, riskTier, advisory, customMessage) => {
  try {
    const cleanPhone = normalizePhoneNumber(phoneNumber);
    if (!cleanPhone) {
      return { success: false, error: 'Invalid or missing recipient phone number' };
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
    const fromPhone = normalizePhoneNumber(process.env.TWILIO_PHONE_NUMBER) || process.env.TWILIO_PHONE_NUMBER;

    if (!client || !fromPhone) {
      console.log(`[MOCK TWILIO SMS] -> To: ${cleanPhone} | Body: ${bodyText}`);
      return { success: true, sid: `mock_sms_${Date.now()}`, mock: true };
    }

    let message;
    try {
      // 1. Try sending the full informative custom message
      message = await client.messages.create({
        from: fromPhone,
        to: cleanPhone,
        body: bodyText,
      });
    } catch (sendErr) {
      // 2. Handle Twilio trial restrictions (Code 572006 or 21614: template required)
      if (
        sendErr.code === 572006 ||
        sendErr.code === 21614 ||
        (sendErr.message && sendErr.message.includes('predefined SMS templates'))
      ) {
        console.log(`ℹ️ Twilio trial account restriction detected (Code ${sendErr.code || 572006}). Sending trial template '${trialTemplate}' to ${cleanPhone}...`);
        message = await client.messages.create({
          from: fromPhone,
          to: cleanPhone,
          body: trialTemplate,
        });
      } else if (sendErr.code === 21608) {
        // Unverified number on trial account
        const errorMsg = `Recipient ${cleanPhone} is unverified. Trial accounts require verified numbers at twilio.com/console/phone-numbers/verified.`;
        console.warn(`⚠️ Twilio notice (Code 21608): ${errorMsg}`);
        return { success: false, code: 21608, error: errorMsg };
      } else {
        throw sendErr;
      }
    }

    console.log(`✅ Alert SMS successfully sent to ${cleanPhone}. SID: ${message.sid}`);
    return { success: true, sid: message.sid, to: cleanPhone };
  } catch (error) {
    console.error(`❌ Twilio SMS Error for ${phoneNumber}:`, error.message);
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Dispatch a WhatsApp Alert via Twilio (with automatic normalization & sandbox handling)
 */
exports.sendWhatsApp = async (phoneNumber, wardNameOrMessage, riskTier, advisory, customMessage) => {
  try {
    const rawClean = normalizePhoneNumber(phoneNumber);
    if (!rawClean) {
      return { success: false, error: 'Invalid or missing recipient phone number' };
    }

    const cleanDigits = rawClean.replace(/^whatsapp:/, '');
    const to = `whatsapp:${cleanDigits}`;
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
      return { success: true, sid: `mock_wa_${Date.now()}`, mock: true };
    }

    let message;
    try {
      message = await client.messages.create({
        from,
        to,
        body: bodyText,
      });
      console.log(`✅ WhatsApp Alert successfully sent to ${to}. SID: ${message.sid}`);
      return { success: true, sid: message.sid, to };
    } catch (waErr) {
      // Handle WhatsApp Sandbox / ContentSid restrictions gracefully
      if (
        waErr.code === 63016 ||
        waErr.code === 63015 ||
        (waErr.message && waErr.message.includes('ContentSid'))
      ) {
        console.warn(`ℹ️ Twilio WhatsApp policy note (Code ${waErr.code || 63016}): Recipient must join Twilio sandbox by sending 'join <sandbox-keyword>' to +14155238886.`);
        return {
          success: false,
          code: waErr.code || 63016,
          error: `WhatsApp Sandbox restriction: Recipient ${cleanDigits} has not opted into the Twilio Sandbox. Send 'join <sandbox-keyword>' to +14155238886 first.`,
        };
      }
      throw waErr;
    }
  } catch (error) {
    console.error(`❌ Twilio WhatsApp Error for ${phoneNumber}:`, error.message);
    return { success: false, error: error.message, code: error.code };
  }
};