// ============================================================================
// simulate.routes.js — Simulation Toggle Endpoint (THE DEMO BUTTON)
// Owner: Member 1 (Backend Lead)
// When to build: Day 2-3
// ============================================================================
//
// PURPOSE:
//   This is the backend for the most important button in your demo.
//   When the presenter clicks "Simulate Heatwave" in the frontend,
//   this endpoint force-writes a DailyRisk document with the specified
//   tier, which the riskWatcher then detects and sends an alert for.
//
// ENDPOINT TO BUILD:
//
//   POST /api/simulate
//   - Body: { "wardId": "AHM-W03", "tier": "Extreme" }
//   - Creates or updates a DailyRisk document:
//     {
//       wardId: req.body.wardId,
//       date: new Date().toISOString().split('T')[0],  // today
//       hvi: 95,                    // high value to justify the tier
//       forecastTempC: 47,          // realistic extreme temp
//       forecastHumidity: 25,
//       riskTier: req.body.tier,
//       computedAt: new Date(),
//       isSimulated: true           // flag so you can distinguish from real data
//     }
//   - Use upsert on { wardId, date } to avoid duplicates
//   - Response: { success: true, wardId, tier, message: "Simulation active" }
//
// THE DEMO FLOW:
//   1. Frontend SimulationToggle.jsx calls POST /api/simulate
//   2. This endpoint writes/updates a DailyRisk with Extreme tier
//   3. riskWatcher.cron.js (running every 30s) detects the new Extreme tier
//   4. Watcher checks AlertLog — no existing alert for this ward+date+tier
//   5. Watcher sends SMS via Twilio → SMS arrives on stage phone
//   6. Frontend refetches /api/wards → map recolors the ward to red
//
// VALIDATE:
//   - wardId must exist in the wards collection
//   - tier must be one of: "Low", "Moderate", "Severe", "Extreme"
//   - Return 400 for invalid input
//
// CONTROLLER:
//   Business logic in controllers/simulateController.js
//
// ============================================================================
