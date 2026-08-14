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