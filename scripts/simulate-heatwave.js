const path = require('path');
const backendModules = path.join(__dirname, '../backend/node_modules');
const dotenv = require(path.join(backendModules, 'dotenv'));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const args = process.argv.slice(2);
let wardId = "JPR-W02";
let tier = "Extreme";

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--wardId' && args[i + 1]) {
    wardId = args[i + 1];
  } else if (args[i] === '--tier' && args[i + 1]) {
    tier = args[i + 1];
  }
}

async function simulate() {
  console.log(`Triggering Simulation: Ward=${wardId}, Tier=${tier}...`);
  try {
    const res = await fetch('http://localhost:5000/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wardId, tier })
    });
    const data = await res.json();
    if (data.success) {
      console.log(`✅ Simulation triggered via Express API: ${wardId} → ${tier}`);
      console.log(`📡 Risk watcher will dispatch alerts on its next cycle (~30s).`);
      return;
    }
    throw new Error(data.message || 'API error');
  } catch (apiErr) {
    console.warn(`Express API notice (${apiErr.message}). Writing directly to MongoDB...`);
    try {
      const mongoose = require(path.join(backendModules, 'mongoose'));
      const DailyRisk = require('../backend/src/models/DailyRisk');
      const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/urban_heatwave";
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      const todayStr = new Date().toISOString().split('T')[0];
      await DailyRisk.findOneAndUpdate(
        { wardId, date: todayStr },
        { $set: { riskTier: tier, hvi: 95, isSimulated: true, forecastTempC: 46, forecastHumidity: 20 } },
        { upsert: true, new: true }
      );
      console.log(`✅ DailyRisk written directly to MongoDB: ${wardId} → ${tier}`);
      await mongoose.disconnect();
    } catch (dbErr) {
      console.error(`❌ Failed to simulate:`, dbErr.message);
    }
  }
}

simulate();
