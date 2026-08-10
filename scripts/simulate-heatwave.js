// ============================================================================
// simulate-heatwave.js — CLI Simulation Fallback
// Owner: Member 5 (Integration/QA Lead)
// When to build: Day 3
// Usage: node scripts/simulate-heatwave.js --wardId AHM-W03 --tier Extreme
// ============================================================================
//
// PURPOSE:
//   Command-line fallback for the Simulation Toggle. If the UI button breaks
//   during the live demo, Member 5 can run this from the terminal to trigger
//   the same effect.
//
// WHAT TO BUILD:
//
//   1. PARSE CLI ARGUMENTS:
//      - --wardId (required): the ward to simulate
//      - --tier (optional, default: "Extreme"): the risk tier to set
//      - Use process.argv or a simple arg parser
//
//   2. OPTION A — Call the Express API:
//      - POST http://localhost:5000/api/simulate
//      - Body: { wardId, tier }
//      - Use axios or the built-in fetch (Node 18+)
//      - Log: "✅ Simulation triggered: {wardId} → {tier}"
//
//   3. OPTION B — Write directly to MongoDB:
//      - Connect to MongoDB using MONGO_URI
//      - Upsert a DailyRisk document (same shape as simulateController)
//      - This bypasses Express entirely (useful if Express is down)
//      - Log: "✅ DailyRisk written directly: {wardId} → {tier}"
//
//   Recommendation: Build both options. Try Option A first, fall back to B.
//
// EXAMPLE USAGE:
//   node scripts/simulate-heatwave.js --wardId AHM-W03 --tier Extreme
//   node scripts/simulate-heatwave.js --wardId AHM-W03 --tier Low    (to reset)
//
// DEPENDENCIES:
//   - axios or node-fetch (for Option A)
//   - mongoose or mongodb (for Option B)
//   - dotenv
//
// ============================================================================
