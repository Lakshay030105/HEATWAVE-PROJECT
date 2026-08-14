const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  wardId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  cityId: { 
    type: String, 
    required: true 
  },
  boundary: {
    type: { 
      type: String, 
      enum: ['Polygon'], 
      required: true 
    },
    coordinates: { 
      type: Array, 
      required: true 
    }
  },
  population: { 
    type: Number, 
    required: true 
  },
  pctElderly: { 
    type: Number, 
    required: true 
  },
  pctOutdoorWorkers: { 
    type: Number, 
    required: true 
  },
  greenCoverPct: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true }); // This automatically creates the createdAt and updatedAt fields

// Add a 2dsphere index on boundary for geospatial queries as requested in line 32
wardSchema.index({ boundary: '2dsphere' });

module.exports = mongoose.model('Ward', wardSchema);