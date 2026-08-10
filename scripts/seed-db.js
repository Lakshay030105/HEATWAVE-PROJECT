// ============================================================================
// seed-db.js — Database Seeder Script
// Owner: Member 5 (Integration/QA Lead), with Member 1
// When to build: Day 1-2
// Usage: node scripts/seed-db.js
// ============================================================================
//
// PURPOSE:
//   Load ward boundary GeoJSON and census demographic data into MongoDB.
//   Run this once after the Atlas cluster is set up and data files are ready.
//   Also seeds sample cooling centers for the demo.
//
// WHAT TO BUILD:
//
//   1. CONNECT TO MONGODB:
//      - Read MONGO_URI from environment (dotenv) or hardcode for initial setup
//      - Use mongoose or native mongodb driver to connect
//
//   2. SEED WARDS:
//      - Read ai-service/data/ward_boundaries.geojson
//      - Read ai-service/data/census_demographics.csv
//      - For each ward in the GeoJSON:
//        a. Extract ward boundary polygon from GeoJSON features
//        b. Match with census CSV by ward ID/name
//        c. Create a Ward document with:
//           { wardId, name, cityId, boundary, population,
//             pctElderly, pctOutdoorWorkers, greenCoverPct }
//        d. Upsert to avoid duplicates on re-run
//
//   3. SEED COOLING CENTERS:
//      - Create 2-3 sample Resource documents per ward:
//        { wardId, type: "cooling_center", name: "Municipal Community Hall",
//          capacity: 100, currentOccupancy: 30, status: "open",
//          lat: <within ward>, lng: <within ward> }
//      - Use realistic names: schools, community halls, religious buildings
//
//   4. SEED SAMPLE DAILY RISKS (optional):
//      - Create a few DailyRisk documents with different tiers
//      - This lets the frontend team test without waiting for the AI service
//      - Mark these with isSimulated: true
//
//   5. LOG RESULTS:
//      - "✅ Seeded X wards"
//      - "✅ Seeded Y cooling centers"
//      - "✅ Seeded Z sample daily risks"
//      - Disconnect from MongoDB
//
// CSV PARSING:
//   Use a simple CSV parser:
//     const fs = require('fs');
//     const csv = fs.readFileSync('path/to/file.csv', 'utf-8');
//     const rows = csv.split('\n').map(row => row.split(','));
//   Or use the 'csv-parser' npm package for more robust parsing.
//
// DEPENDENCIES:
//   - mongoose or mongodb (native driver)
//   - fs (for reading files)
//   - dotenv (for MONGO_URI)
//   - path (for resolving file paths)
//
// ============================================================================
