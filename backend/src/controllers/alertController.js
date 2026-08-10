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
