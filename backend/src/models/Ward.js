// ============================================================================
// Ward.js — Mongoose Model for Ward Data
// Owner: Member 1 (Backend Lead)
// When to build: Day 1
// ============================================================================
//
// PURPOSE:
//   Define the schema for ward geographical and demographic data.
//   Wards are the fundamental unit of the entire system — every other
//   collection references a wardId.
//
// SCHEMA FIELDS:
//   wardId:            String, required, unique  (e.g., "AHM-W03")
//   name:              String, required          (e.g., "Jamalpur Ward")
//   cityId:            String, required          (e.g., "ahmedabad")
//   boundary:          Object, required          (GeoJSON Polygon — see below)
//   population:        Number, required
//   pctElderly:        Number, required          (0.0 – 1.0)
//   pctOutdoorWorkers: Number, required          (0.0 – 1.0)
//   greenCoverPct:     Number, required          (0.0 – 1.0)
//   createdAt:         Date, default: Date.now
//   updatedAt:         Date, default: Date.now
//
// GEOJSON BOUNDARY FORMAT:
//   The boundary field stores a GeoJSON Polygon. Example:
//   {
//     type: "Polygon",
//     coordinates: [[[72.58, 23.03], [72.59, 23.03], [72.59, 23.04], [72.58, 23.03]]]
//   }
//
//   Add a 2dsphere index on boundary for geospatial queries:
//   WardSchema.index({ boundary: '2dsphere' });
//
// REFERENCE:
//   See docs/API_CONTRACTS.md → "wards" collection for the full spec.
//   Data comes from scripts/seed-db.js loading ward_boundaries.geojson
//   and census_demographics.csv
//
// ============================================================================
