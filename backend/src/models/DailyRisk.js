const mongoose = require('mongoose');

const dailyRiskSchema = new mongoose.Schema({
  wardId: { 
    type: String, 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  hvi: { 
    type: Number, 
    required: true 
  },
  forecastTempC: { 
    type: Number 
  },
  forecastHumidity: { 
    type: Number 
  },
  riskTier: { 
    type: String, 
    required: true, 
    enum: ['Low', 'Moderate', 'Severe', 'Extreme'] 
  },
  computedAt: { 
    type: Date, 
    default: Date.now 
  },
  isSimulated: { 
    type: Boolean, 
    default: false 
  }
});

// INDEXES (As requested in lines 25-27)
// 1. Compound unique index to ensure only one risk assessment per ward per day
dailyRiskSchema.index({ wardId: 1, date: 1 }, { unique: true });
// 2. Index for the cron watcher to quickly find Extreme/Severe risks
dailyRiskSchema.index({ riskTier: 1 });
// 3. Index for quickly fetching the latest dates
dailyRiskSchema.index({ date: -1 });

module.exports = mongoose.model('DailyRisk', dailyRiskSchema);