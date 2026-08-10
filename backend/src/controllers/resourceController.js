// ============================================================================
// resourceController.js — Business Logic for Resource Endpoints
// Owner: Member 1 (Backend Lead)
// When to build: Day 2-3
// ============================================================================
//
// WHAT TO BUILD:
//
//   1. exports.getResources = async (req, res) => { ... }
//      - Query Resource collection
//      - Filter by req.query.type if present (e.g., "cooling_center")
//      - Filter by req.query.wardId if present
//      - Sort by name
//
//   2. exports.updateResource = async (req, res) => { ... }
//      - Find Resource by _id (req.params.id)
//      - Update currentOccupancy and/or status from req.body
//      - Set updatedAt to now
//      - Return 404 if not found
//
// ============================================================================
