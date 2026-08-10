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
