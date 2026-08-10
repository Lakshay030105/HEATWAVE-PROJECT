// ============================================================================
// CitizenView.jsx — "Check My Area" Widget
// Owner: Member 4 (Frontend/UX Developer)
// When to build: Day 3-4
// ============================================================================
//
// PURPOSE:
//   A citizen-facing widget where a resident can look up their ward
//   and see: current risk level, advisory, and nearest cooling center.
//
// WHAT TO BUILD:
//
//   1. WARD SEARCH/SELECT:
//      - A search input or dropdown listing all ward names
//      - On selection, fetch ward details + latest risk from API
//      - Show the ward on a small map (reuse HeatMap component or a simpler version)
//
//   2. RISK DISPLAY CARD:
//      - Large colored badge showing current risk tier
//      - Risk-appropriate advisory text:
//        Low:      "No heat risk. Stay hydrated as usual."
//        Moderate: "Moderate heat expected. Limit outdoor activity 11am-3pm."
//        Severe:   "High heat risk. Stay indoors. Drink water frequently."
//        Extreme:  "EXTREME DANGER. Seek nearest cooling center immediately."
//      - HVI score with a simple explanation:
//        "Your area's vulnerability score: 72/100 (factors: elderly population,
//        low green cover)"
//
//   3. NEAREST COOLING CENTER:
//      - Fetch resources for the selected ward
//      - Show name, address, status (open/closed/full), distance
//      - Link to Google Maps directions (optional but impressive)
//
//   4. ALERT SUBSCRIPTION (STRETCH):
//      - A simple form to enter phone number for SMS alerts
//      - "Get alerts for this ward" button
//      - Even if not wired to real subscriptions, the UI shows the concept
//
// DESIGN NOTES:
//   - This page should be mobile-responsive (citizens use phones)
//   - Use large text and clear colors (elderly users)
//   - Keep it simple — not everyone is tech-savvy
//
// DEPENDENCIES:
//   - api.js (fetch ward, risk, resources)
//   - Risk tier color constants from styles/index.css
//
// ============================================================================
