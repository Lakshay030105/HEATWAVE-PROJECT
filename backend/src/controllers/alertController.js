// ============================================================================
// alertController.js — Business Logic for Alert Log Endpoints
// Owner: Member 1 (Backend Lead)
// When to build: Day 2-3
// ============================================================================
//
// WHAT TO BUILD:
//
//   1. exports.getAlerts = async (req, res) => { ... }
//      - Query AlertLog collection
//      - Sort by sentAt descending, limit 50
//      - If req.query.wardId exists, filter by wardId
//      - Mask recipientPhone in response (show last 4 digits only)
//
// NOTE:
//   AlertLog documents are CREATED by riskWatcher.cron.js, not here.
//   This controller only reads them.
//
// ============================================================================


const AlertLog = require('../models/AlertLog');

// 1. Fetch recent alerts with optional ward filtering and phone masking
exports.getAlerts = async (req, res, next) => {
  try {
    // Build the query object if the frontend asks for a specific ward
    const query = {};
    if (req.query.wardId) {
      query.wardId = req.query.wardId;
    }

    // Query the database, sort by newest (descending), limit to 50, and use .lean()
    const alerts = await AlertLog.find(query)
      .sort({ sentAt: -1 })
      .limit(50)
      .lean();

    // Loop through the results to mask the phone numbers before sending them to the frontend
    const maskedAlerts = alerts.map(alert => {
      if (alert.recipientPhone) {
        // Extract only the last 4 digits
        const phoneStr = String(alert.recipientPhone);
        const last4 = phoneStr.slice(-4);
        
        // Replace the real number with a masked version
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