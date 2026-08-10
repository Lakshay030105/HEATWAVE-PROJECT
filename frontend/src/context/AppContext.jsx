// ============================================================================
// AppContext.jsx — Global State Management (React Context)
// Owner: Member 3 (Frontend Lead)
// When to build: Day 1-2
// ============================================================================
//
// PURPOSE:
//   Centralized state for ward data, risk data, selected ward, and a
//   refresh function. All components read from this context instead of
//   making their own API calls.
//
// WHAT TO BUILD:
//
//   1. Create the context and provider:
//      const AppContext = createContext();
//      export const AppProvider = ({ children }) => { ... }
//      export const useApp = () => useContext(AppContext);
//
//   2. STATE TO MANAGE:
//      - wards: []              (list of all wards with latest risk, from GET /api/wards)
//      - selectedWard: null     (currently selected ward for detail views)
//      - latestRisks: []        (latest risk for all wards, from GET /api/risk/latest)
//      - alerts: []             (recent alerts, from GET /api/alerts)
//      - resources: []          (cooling centers, from GET /api/resources)
//      - loading: true          (initial data load state)
//      - simulationActive: null (tracks if a simulation is running)
//
//   3. FUNCTIONS TO PROVIDE:
//      - fetchWards()     → calls GET /api/wards, updates wards state
//      - fetchAlerts()    → calls GET /api/alerts, updates alerts state
//      - fetchResources() → calls GET /api/resources, updates resources state
//      - selectWard(wardId) → sets selectedWard
//      - refreshAll()     → re-fetches everything (called after simulation toggle)
//
//   4. AUTO-FETCH ON MOUNT:
//      useEffect(() => { fetchWards(); fetchAlerts(); fetchResources(); }, []);
//
//   5. POLLING (OPTIONAL):
//      Set up a setInterval that calls refreshAll() every 15 seconds
//      so the map stays up-to-date with risk tier changes.
//      Clear the interval on unmount.
//
// WHY CONTEXT INSTEAD OF REDUX:
//   Context is simpler and sufficient for this app's state needs.
//   Don't add Redux overhead for a hackathon project.
//
// DEPENDENCIES:
//   - React (createContext, useContext, useState, useEffect)
//   - api.js (all API call functions)
//
// ============================================================================
