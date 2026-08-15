

const AlertLog = require('../models/AlertLog');
const twilioService = require('../services/twilioService');

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
        const phoneStr = String(alert.recipientPhone);
        const last4 = phoneStr.slice(-4);
        alert.recipientPhone = `******${last4}`;
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

    // If SMS channel, trigger real Twilio dispatch to target phone or verified test number
    if (alertChannel === 'sms') {
      const targetPhone = recipientPhone || process.env.MY_PHONE_NUMBER;
      if (targetPhone) {
        const smsResult = await twilioService.sendSMS(
          targetPhone,
          wardId,
          tier,
          message || `Heat alert for ward ${wardId}`,
          message
        );
        if (!smsResult.success) {
          console.warn(`Twilio broadcast dispatch notice for ${targetPhone}: ${smsResult.error}`);
        }
      }
    } else if (alertChannel === 'whatsapp') {
      const targetPhone = recipientPhone || process.env.MY_PHONE_NUMBER;
      if (targetPhone) {
        const waResult = await twilioService.sendWhatsApp(
          targetPhone,
          wardId,
          tier,
          message || `Heat alert for ward ${wardId}`,
          message
        );
        if (!waResult.success) {
          console.warn(`Twilio WhatsApp dispatch notice for ${targetPhone}: ${waResult.error}`);
        }
      }
    }

    const alert = await AlertLog.create({
      wardId,
      tier,
      channel: alertChannel,
      message: message || '',
      recipientCount: recipientCount || 10000,
      recipientPhone: recipientPhone || process.env.MY_PHONE_NUMBER || undefined,
      dedupeKey: `broadcast-${wardId}-${Date.now()}`,
      status: dispatchStatus,
      sentAt: new Date()
    });

    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    console.error("Error creating alert:", err);
    if (next) return next(err);
    res.status(500).json({ success: false, message: "Server error creating alert" });
  }
};