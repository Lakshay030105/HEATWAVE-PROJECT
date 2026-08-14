// ============================================================================
// Resource.js — Mongoose Model for Cooling Centers & Resources
// Owner: Member 1 (Backend Lead)
// When to build: Day 2
// ============================================================================
//
// PURPOSE:
//   Stores cooling centers, water stations, and medical camps that exist
//   in each ward. Displayed on the map and dashboard to show authorities
//   available capacity and status.
//
// SCHEMA FIELDS:
//   wardId:            String, required
//   type:              String, required, enum: ["cooling_center", "water_station", "medical_camp"]
//   name:              String, required     (e.g., "Municipal Community Hall")
//   address:           String
//   capacity:          Number, required     (max people)
//   currentOccupancy:  Number, default: 0
//   status:            String, enum: ["open", "closed", "full"], default: "open"
//   lat:               Number, required
//   lng:               Number, required
//   updatedAt:         Date, default: Date.now
//
// NOTE:
//   For the demo, seed 2-3 cooling centers per ward using scripts/seed-db.js.
//   Use realistic names and coordinates within the ward boundaries.
//   The dashboard shows a bar chart of capacity vs. occupancy — this is
//   a strong visual for the authority dashboard.
//
// REFERENCE:
//   See docs/API_CONTRACTS.md → "resources" collection
//
// ============================================================================

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  wardId: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['cooling_center', 'water_station', 'medical_camp'] 
  },
  name: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String 
  },
  capacity: { 
    type: Number, 
    required: true 
  },
  currentOccupancy: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['open', 'closed', 'full'], 
    default: 'open' 
  },
  lat: { 
    type: Number, 
    required: true 
  },
  lng: { 
    type: Number, 
    required: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Resource', resourceSchema);