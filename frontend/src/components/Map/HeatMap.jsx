// ============================================================================
// HeatMap.jsx — Interactive Ward Map (react-leaflet)
// Owner: Member 3 (Frontend Lead)
// When to build: Day 1 (scaffold), Day 2 (real data), Day 3 (simulation)
// ============================================================================
//
// PURPOSE:
//   THE core visual of the entire project. A Leaflet map showing ward
//   polygons colored by risk tier. This is the first thing judges see.
//
// WHAT TO BUILD:
//
//   1. Set up a Leaflet MapContainer:
//      - Center on your target city (e.g., Ahmedabad: [23.03, 72.58])
//      - Zoom level ~12 (shows ward-level detail)
//      - Use OpenStreetMap tile layer (free, no API key)
//
//   2. For each ward from the API (GET /api/wards):
//      - Render a GeoJSON polygon using react-leaflet's GeoJSON component
//      - Color the polygon fill based on the ward's riskTier:
//        Low      → #22c55e (green)
//        Moderate → #f59e0b (amber)
//        Severe   → #f97316 (orange)
//        Extreme  → #ef4444 (red)
//      - Use fillOpacity: 0.6 so the base map is still visible
//
//   3. Add a popup on each ward polygon (click to open):
//      - Ward name
//      - Current risk tier (with color badge)
//      - HVI score
//      - Key stats: population, % elderly, % outdoor workers, green cover %
//      - Forecast temperature
//
//   4. Add a legend showing the 4 risk tier colors
//
//   5. IMPORTANT: The map should REFETCH and RECOLOR when:
//      - The simulation toggle fires (risk tier changes)
//      - Use AppContext or polling (refetch every 10-15 seconds)
//      - This is what makes the demo impressive — click simulate,
//        watch the map change color in real time
//
// DEPENDENCIES:
//   - react-leaflet (MapContainer, TileLayer, GeoJSON, Popup)
//   - leaflet (import 'leaflet/dist/leaflet.css' in your styles)
//   - AppContext or direct API call for ward data
//
// LEAFLET CSS FIX:
//   You MUST import Leaflet's CSS or the map won't render correctly:
//   import 'leaflet/dist/leaflet.css';
//
// TILE LAYER URL:
//   https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
//   attribution: '© OpenStreetMap contributors'
//
// ============================================================================
