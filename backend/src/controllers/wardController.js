// ============================================================================
// wardController.js — Business Logic for Ward Endpoints
// Owner: Member 1 (Backend Lead)
// When to build: Day 2
// ============================================================================
//
// WHAT TO BUILD:
//
//   1. exports.getAllWards = async (req, res) => { ... }
//      - Fetch all wards from MongoDB
//      - Join each ward with its latest DailyRisk (aggregation or two queries)
//      - Return the combined data
//      - This is the most-called endpoint — the map loads this on every page load
//
//   2. exports.getWardById = async (req, res) => { ... }
//      - Fetch a single ward by wardId (from req.params.wardId)
//      - Include latest risk tier, demographics, boundary
//      - Return 404 if ward not found
//
// ERROR HANDLING:
//   Wrap in try/catch, pass errors to next(err) for the error middleware
//   Return { success: false, message: "..." } on errors
//
// ============================================================================
