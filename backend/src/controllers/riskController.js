// ============================================================================
// riskController.js — Business Logic for Risk Endpoints
// Owner: Member 1 (Backend Lead)
// When to build: Day 2
// ============================================================================
//
// WHAT TO BUILD:
//
//   1. exports.getRiskHistory = async (req, res) => { ... }
//      - Query DailyRisk by wardId (from req.params.wardId)
//      - Sort by date descending, limit 30
//      - Used by Dashboard trend chart
//
//   2. exports.getLatestRisks = async (req, res) => { ... }
//      - Get the most recent DailyRisk for each ward
//      - Use aggregation: group by wardId, take the doc with max date
//      - Used by the map for current coloring
//
// ============================================================================

const DailyRisk = require('../models/DailyRisk');

// 1. Fetch the 30-day history for a specific ward (for the trend chart)
exports.getRiskHistory = async (req, res, next) => {
  try {
    const { wardId } = req.params;
    
    // .find() the specific ward, sort by newest first (-1), and strictly limit to 30 results
    const history = await DailyRisk.find({ wardId: wardId })
      .sort({ date: -1 })
      .limit(30)
      .lean();
      
      res.status(200).json({ success: true, data: history });
  } catch (err) {
    console.error("Error fetching risk history:", err);
    res.status(500).json({ success: false, message: "Server error fetching risk history" });
    if (next) next(err);
  }
};

// 2. Fetch only the single newest risk document for every ward (for the map colors)
exports.getLatestRisks = async (req, res, next) => {
  try {
    // The Aggregation Pipeline
    const latestRisks = await DailyRisk.aggregate([
      // Step 1: Sort everything by date descending (newest at the top)
      { $sort: { date: -1 } },
      
      // Step 2: Group all documents by wardId. Since they are sorted, taking the $first one grabs the newest date.
      { 
        $group: { 
          _id: "$wardId", 
          latestDocument: { $first: "$$ROOT" } 
        } 
      },
      
      // Step 3: Clean up the output so it just returns the risk document directly
      { 
        $replaceRoot: { newRoot: "$latestDocument" } 
      }
    ]);

    res.status(200).json({ success: true, data: latestRisks });
  } catch (err) {
    console.error("Error fetching latest risks:", err);
    res.status(500).json({ success: false, message: "Server error fetching latest risks" });
    if (next) next(err);
  }
};