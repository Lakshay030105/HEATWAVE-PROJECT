
const Resource = require('../models/Resource');

// 1. Fetch resources with optional query filters
exports.getResources = async (req, res, next) => {
  try {
    // Build the query object dynamically based on what the frontend URL asks for
    const query = {};
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.wardId) {
      query.wardId = req.query.wardId;
    }

    // Pass the built query to Mongoose, and sort alphabetically by name (1 = ascending)
    const resources = await Resource.find(query).sort({ name: 1 });
    
    res.status(200).json({ success: true, data: resources });
  } catch (err) {
    console.error("Error fetching resources:", err);
    res.status(500).json({ success: false, message: "Server error fetching resources" });
    if (next) next(err);
  }
};

// 2. Update a specific resource's occupancy or status
exports.updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentOccupancy, status } = req.body;

    // Build the update object, automatically setting updatedAt to exactly right now
    const updateFields = {
      updatedAt: Date.now()
    };

    // Only update these fields if the frontend actually sent them
    if (currentOccupancy !== undefined) updateFields.currentOccupancy = currentOccupancy;
    if (status !== undefined) updateFields.status = status;

    // Find the resource by its MongoDB _id and update it. 
    // { new: true } tells Mongoose to return the newly updated document, not the old one.
    const updatedResource = await Resource.findByIdAndUpdate(
      id, 
      updateFields, 
      { new: true }
    );

    // Return 404 exactly as requested in line 19
    if (!updatedResource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    res.status(200).json({ success: true, data: updatedResource });
  } catch (err) {
    console.error("Error updating resource:", err);
    res.status(500).json({ success: false, message: "Server error updating resource" });
    if (next) next(err);
  }
};