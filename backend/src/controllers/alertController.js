const AlertLog = require('../models/AlertLog');
const twilioService = require('../services/twilioService');
const { normalizePhoneNumber, maskPhoneNumber } = require('../utils/phoneUtils');

// 1. Fetch recent alerts with optional ward filtering and phone masking
exports.getAlerts = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.wardId) {
      query.wardId = req.query.wardId;
    }

    const alerts = await AlertLog.find(query)
      .sort({ sentAt: -1 })
      .limit(50)
      .lean();

    const maskedAlerts = alerts.map(alert => {
      if (alert.recipientPhone) {
        alert.recipientPhone = maskPhoneNumber(alert.recipientPhone);
      }
      return alert;
    });

    res.status(200).json({ success: true, data: maskedAlerts });
  } catch (err) {
    console.error("Error fetching alerts:", err);
    if (next) return next(err);
    res.status(500).json({ success: false, message: "Server error fetching alerts" });
  }
};

// 2. Dispatch / Record a new broadcast alert
exports.createAlert = async (req, res, next) => {
  try {
    const { wardId, tier, channel, message, recipientCount, recipientPhone, status } = req.body;

    if (!wardId || !tier) {
      return res.status(400).json({ success: false, message: "wardId and tier are required" });
    }

    const alertChannel = channel || 'sms';
    let dispatchStatus = status || 'sent';
    let dispatchResult = null;

    // Normalize phone number (prioritizing custom recipientPhone, then environment variable)
    const rawPhone = recipientPhone || process.env.MY_PHONE_NUMBER;
    const targetPhone = normalizePhoneNumber(rawPhone);

    // If SMS channel, trigger real Twilio dispatch to target phone or verified test number
    if (alertChannel === 'sms') {
      if (targetPhone) {
        dispatchResult = await twilioService.sendSMS(
          targetPhone,
          wardId,
          tier,
          message || `Heat alert for ward ${wardId}`,
          message
        );
        dispatchStatus = dispatchResult.success ? 'sent' : 'failed';
        if (!dispatchResult.success) {
          console.warn(`Twilio broadcast dispatch notice for ${targetPhone}: ${dispatchResult.error}`);
        }
      }
    } else if (alertChannel === 'whatsapp') {
      if (targetPhone) {
        dispatchResult = await twilioService.sendWhatsApp(
          targetPhone,
          wardId,
          tier,
          message || `Heat alert for ward ${wardId}`,
          message
        );
        dispatchStatus = dispatchResult.success ? 'sent' : 'failed';
        if (!dispatchResult.success) {
          console.warn(`Twilio WhatsApp dispatch notice for ${targetPhone}: ${dispatchResult.error}`);
        }
      }
    }

    const alert = await AlertLog.create({
      wardId,
      tier,
      channel: alertChannel,
      message: message || '',
      recipientCount: recipientCount || 10000,
      recipientPhone: targetPhone || undefined,
      dedupeKey: `broadcast-${wardId}-${Date.now()}`,
      status: dispatchStatus,
      sentAt: new Date()
    });

    res.status(201).json({ 
      success: true, 
      data: alert,
      dispatchResult
    });
  } catch (err) {
    console.error("Error creating alert:", err);
    if (next) return next(err);
    res.status(500).json({ success: false, message: "Server error creating alert" });
  }
};