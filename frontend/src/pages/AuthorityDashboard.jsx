// ============================================================================
// AuthorityDashboard.jsx — Main Authority Page
// Owner: Member 3 (Frontend Lead) — assembles components from Member 3 + 4
// When to build: Day 2 (layout), Day 3-4 (wiring)
// ============================================================================
//
// PURPOSE:
//   The primary page judges see. Assembles the map, dashboard, and
//   simulation toggle into a cohesive authority view.
//
// WHAT TO BUILD:
//
//   1. LAYOUT (use CSS Grid or Flexbox):
//      ┌──────────────────────────────────────┐
//      │           Navigation Bar             │
//      ├───────────────────┬──────────────────┤
//      │                   │  SimulationToggle │
//      │    HeatMap        ├──────────────────┤
//      │    (large,        │  Ward Risk       │
//      │     left side)    │  Summary Table   │
//      │                   ├──────────────────┤
//      │                   │  Recent Alerts   │
//      ├───────────────────┴──────────────────┤
//      │            Dashboard (Charts)         │
//      │  ┌─────────────┐  ┌─────────────────┐│
//      │  │ Cooling     │  │ Temperature     ││
//      │  │ Center Bar  │  │ Trend Line      ││
//      │  │ Chart       │  │ Chart           ││
//      │  └─────────────┘  └─────────────────┘│
//      └──────────────────────────────────────┘
//
//   2. Import and render:
//      - <HeatMap />
//      - <SimulationToggle />
//      - <Dashboard />
//
//   3. The map should take ~60% width, sidebar ~40%
//      Dashboard charts span full width below the map
//
// DESIGN:
//   - Dark background works well for dashboards (makes the map colors pop)
//   - Use the risk tier colors consistently throughout
//   - Make it look professional — this is what judges evaluate visually
//
// ============================================================================
