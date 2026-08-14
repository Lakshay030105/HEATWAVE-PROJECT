

const AlertLog = require('../models/AlertLog');

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
    res.status(500).json({ success: false, message: "Server error fetching alerts" });
    if (next) next(err);
  }
};

// 2. Dispatch / Record a new broadcast alert
exports.createAlert = async (req, res, next) => {
  try {
    const { wardId, tier, channel, message, recipientCount, recipientPhone, status } = req.body;

    if (!wardId || !tier) {
      return res.status(400).json({ success: false, message: "wardId and tier are required" });
    }

    const alert = await AlertLog.create({
      wardId,
      tier,
      channel: channel || 'sms',
      message: message || '',
      recipientCount: recipientCount || 10000,
      recipientPhone: recipientPhone || undefined,
      dedupeKey: `broadcast-${wardId}-${Date.now()}`,
      status: status || 'sent',
      sentAt: new Date()
    });

    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    console.error("Error creating alert:", err);
    res.status(500).json({ success: false, message: "Server error creating alert" });
    if (next) next(err);
  }
};