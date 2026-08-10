// ============================================================================
// Dashboard.jsx — Authority Dashboard with Recharts
// Owner: Member 4 (Frontend/UX Developer)
// When to build: Day 2 (chart shells), Day 3-4 (real data)
// ============================================================================
//
// PURPOSE:
//   The authority-facing analytics dashboard. Shows cooling center capacity,
//   temperature trends, alert history, and ward risk summary.
//
// WHAT TO BUILD:
//
//   1. COOLING CENTER CAPACITY BAR CHART:
//      - Fetch resources from GET /api/resources?type=cooling_center
//      - Recharts BarChart showing capacity vs. currentOccupancy per center
//      - Color bars: green if under 70% full, amber 70-90%, red 90%+
//      - This shows authorities where they need to open more capacity
//
//   2. TEMPERATURE TREND LINE CHART:
//      - Fetch risk history from GET /api/wards/:wardId/risk
//      - Recharts LineChart showing forecastTempC and hvi over time
//      - Use the currently selected ward from AppContext
//      - X-axis: dates, Y-axis: temperature and HVI score
//
//   3. WARD RISK SUMMARY TABLE/GRID:
//      - Show all demo wards with their current risk tier
//      - Color-coded badges (Low/Moderate/Severe/Extreme)
//      - Click a ward to select it (updates the trend chart)
//
//   4. RECENT ALERTS LOG:
//      - Fetch from GET /api/alerts (last 10-20)
//      - Show: ward name, tier, channel (SMS/push), time sent
//      - Scrollable list
//
//   5. SUGGESTED ACTIONS PANEL (Day 4):
//      - Based on current risk tiers, show actionable suggestions:
//        "Open additional cooling center in Ward X"
//        "Deploy water distribution in Ward Y"
//      - These can be derived from the risk tier + resource status
//
// RECHARTS SETUP:
//   import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
//   Recharts uses a simple data array format:
//     const data = [{ name: 'Center A', capacity: 100, current: 45 }, ...];
//
// DEPENDENCIES:
//   - recharts
//   - AppContext (for selected ward, ward list)
//   - api.js (for data fetching)
//
// ============================================================================
