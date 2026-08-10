// ============================================================================
// SimulationToggle.jsx — THE Demo Button
// Owner: Member 3 (Frontend Lead)
// When to build: Day 3
// ============================================================================
//
// PURPOSE:
//   The single most important UI element in your demo. This component lets
//   the presenter force a ward to "Extreme" risk, triggering the entire
//   alert pipeline live on stage.
//
// WHAT TO BUILD:
//
//   1. A dropdown/select to pick a ward (from the ward list in AppContext)
//
//   2. A dropdown/select to pick a risk tier:
//      - "Extreme" (default — this is what you demo)
//      - "Severe"
//      - "Moderate"
//      - "Low" (to reset after demo)
//
//   3. A big, prominent button: "🔥 Simulate Heatwave"
//      - Style it distinctly — red/orange, large, impossible to miss on screen
//      - On click: call POST /api/simulate with { wardId, tier }
//      - Show a loading spinner while the request is in flight
//      - On success: show a toast/notification "Simulation active for [Ward Name]"
//      - Trigger a data refresh in AppContext so the map recolors
//
//   4. A status indicator:
//      - "No simulation active" (green dot)
//      - "Simulation active: [Ward Name] at [Tier]" (red pulsing dot)
//
// DEMO UX:
//   During the live demo, the presenter will:
//   1. Select the highest-vulnerability ward from the dropdown
//   2. Select "Extreme" tier
//   3. Click the button
//   4. Wait 30-60 seconds for the map to recolor and SMS to arrive
//
//   Make this flow as smooth and visual as possible. The button click
//   is the "wow moment" — judges should see the cause and effect clearly.
//
// FALLBACK:
//   If this component breaks on stage, Member 5 can run:
//     node scripts/simulate-heatwave.js --wardId AHM-W03 --tier Extreme
//   from the terminal as a CLI fallback.
//
// DEPENDENCIES:
//   - AppContext (ward list, refresh function)
//   - api.js (POST /api/simulate)
//
// ============================================================================
