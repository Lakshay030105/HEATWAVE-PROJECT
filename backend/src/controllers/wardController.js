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

const Ward = require('../models/Ward');
const DailyRisk = require('../models/DailyRisk'); // You need this model to do the join

// 1. Fetch all wards and join with their latest DailyRisk
exports.getAllWards = async (req, res, next) => {
  try {
    // We use .lean() to get raw JavaScript objects instead of heavy Mongoose documents, making it easier to combine data
    const wards = await Ward.find().lean();
    
    // Fetch all risks, sorted by newest date first
    const risks = await DailyRisk.find().sort({ date: -1 }).lean();

    // Map through each ward and attach its corresponding newest risk
    const combinedWards = wards.map(ward => {
      const latestRisk = risks.find(risk => risk.wardId === ward.wardId);
      return {
        ...ward,
        latestRisk: latestRisk || null
      };
    });

    res.status(200).json({ success: true, data: combinedWards });
  } catch (err) {
    console.error("Error fetching all wards:", err);
    res.status(500).json({ success: false, message: "Server error fetching wards data" });
    next(err); // Passes the error to the custom middleware as requested
  }
};

// 2. Fetch a single ward by its ID
exports.getWardById = async (req, res, next) => {
  try {
    const { wardId } = req.params;
    
    // Find the specific ward
    const ward = await Ward.findOne({ wardId: wardId }).lean();

    // If the ward doesn't exist, return a 404 exactly as requested
    if (!ward) {
      return res.status(404).json({ success: false, message: "Ward not found" });
    }

    // Find the latest risk for just this specific ward
    const latestRisk = await DailyRisk.findOne({ wardId: wardId }).sort({ date: -1 }).lean();

    const combinedWard = {
      ...ward,
      latestRisk: latestRisk || null
    };

    res.status(200).json({ success: true, data: combinedWard });
  } catch (err) {
    console.error("Error fetching single ward:", err);
    res.status(500).json({ success: false, message: "Server error fetching single ward" });
    next(err);
  }
};