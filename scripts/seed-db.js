const path = require('path');
const backendModules = path.join(__dirname, '../backend/node_modules');
const dotenv = require(path.join(backendModules, 'dotenv'));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });
const mongoose = require(path.join(backendModules, 'mongoose'));

const Ward = require('../backend/src/models/Ward');
const Resource = require('../backend/src/models/Resource');
const DailyRisk = require('../backend/src/models/DailyRisk');

const JAIPUR_WARDS = [
  {
    wardId: "JPR-W01",
    name: "Malviya Nagar",
    cityId: "jaipur-01",
    population: 45000,
    pctElderly: 0.18,
    pctOutdoorWorkers: 0.22,
    greenCoverPct: 0.14,
    boundary: {
      type: "Polygon",
      coordinates: [[[75.80, 26.84], [75.83, 26.84], [75.83, 26.87], [75.80, 26.87], [75.80, 26.84]]]
    }
  },
  {
    wardId: "JPR-W02",
    name: "Mansarovar",
    cityId: "jaipur-01",
    population: 78000,
    pctElderly: 0.12,
    pctOutdoorWorkers: 0.35,
    greenCoverPct: 0.08,
    boundary: {
      type: "Polygon",
      coordinates: [[[75.74, 26.84], [75.78, 26.84], [75.78, 26.88], [75.74, 26.88], [75.74, 26.84]]]
    }
  },
  {
    wardId: "JPR-W03",
    name: "C-Scheme / Civil Lines",
    cityId: "jaipur-01",
    population: 32000,
    pctElderly: 0.15,
    pctOutdoorWorkers: 0.15,
    greenCoverPct: 0.25,
    boundary: {
      type: "Polygon",
      coordinates: [[[75.78, 26.89], [75.81, 26.89], [75.81, 26.92], [75.78, 26.92], [75.78, 26.89]]]
    }
  },
  {
    wardId: "JPR-W04",
    name: "Vaishali Nagar",
    cityId: "jaipur-01",
    population: 52000,
    pctElderly: 0.14,
    pctOutdoorWorkers: 0.28,
    greenCoverPct: 0.12,
    boundary: {
      type: "Polygon",
      coordinates: [[[75.72, 26.89], [75.76, 26.89], [75.76, 26.93], [75.72, 26.93], [75.72, 26.89]]]
    }
  },
  {
    wardId: "JPR-W05",
    name: "Sanganer Industrial",
    cityId: "jaipur-01",
    population: 68000,
    pctElderly: 0.09,
    pctOutdoorWorkers: 0.48,
    greenCoverPct: 0.05,
    boundary: {
      type: "Polygon",
      coordinates: [[[75.76, 26.79], [75.82, 26.79], [75.82, 26.83], [75.76, 26.83], [75.76, 26.79]]]
    }
  },
  {
    wardId: "JPR-W06",
    name: "Amer Old City",
    cityId: "jaipur-01",
    population: 41000,
    pctElderly: 0.20,
    pctOutdoorWorkers: 0.38,
    greenCoverPct: 0.18,
    boundary: {
      type: "Polygon",
      coordinates: [[[75.84, 26.96], [75.88, 26.96], [75.88, 27.00], [75.84, 27.00], [75.84, 26.96]]]
    }
  }
];

const SAMPLE_RESOURCES = [
  { wardId: "JPR-W01", type: "cooling_center", name: "Malviya Community Center", address: "Sector 3, Malviya Nagar", capacity: 150, currentOccupancy: 45, status: "open", lat: 26.855, lng: 75.815 },
  { wardId: "JPR-W01", type: "water_station", name: "Apex Circle Hydration Point", address: "Apex Circle, Malviya Nagar", capacity: 500, currentOccupancy: 120, status: "open", lat: 26.852, lng: 75.819 },
  { wardId: "JPR-W02", type: "cooling_center", name: "Mansarovar Urban Health Post", address: "Madhyam Marg, Mansarovar", capacity: 200, currentOccupancy: 95, status: "open", lat: 26.862, lng: 75.762 },
  { wardId: "JPR-W02", type: "medical_camp", name: "Shipra Path Emergency Heat Camp", address: "Shipra Path, Mansarovar", capacity: 80, currentOccupancy: 60, status: "open", lat: 26.859, lng: 75.768 },
  { wardId: "JPR-W03", type: "cooling_center", name: "SMS Stadium Cooling Hub", address: "Ambedkar Circle, C-Scheme", capacity: 300, currentOccupancy: 80, status: "open", lat: 26.905, lng: 75.802 },
  { wardId: "JPR-W04", type: "cooling_center", name: "Amrapali Circle Relief Point", address: "Amrapali Circle, Vaishali Nagar", capacity: 120, currentOccupancy: 40, status: "open", lat: 26.912, lng: 75.742 },
  { wardId: "JPR-W05", type: "cooling_center", name: "Sanganer Mandi Emergency Shelter", address: "Main Market, Sanganer", capacity: 250, currentOccupancy: 180, status: "open", lat: 26.812, lng: 75.789 },
  { wardId: "JPR-W05", type: "water_station", name: "RIICO Industrial Hydration Station", address: "RIICO Area, Sanganer", capacity: 600, currentOccupancy: 310, status: "open", lat: 26.808, lng: 75.795 },
  { wardId: "JPR-W06", type: "cooling_center", name: "Amer Heritage Relief Hall", address: "Amer Fort Road", capacity: 100, currentOccupancy: 30, status: "open", lat: 26.982, lng: 75.858 }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/urban_heatwave";
    console.log(`Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    // Seed Wards
    for (const ward of JAIPUR_WARDS) {
      await Ward.findOneAndUpdate({ wardId: ward.wardId }, { $set: ward }, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${JAIPUR_WARDS.length} Jaipur Wards.`);

    // Seed Resources
    await Resource.deleteMany({});
    await Resource.insertMany(SAMPLE_RESOURCES);
    console.log(`✅ Seeded ${SAMPLE_RESOURCES.length} Cooling Centers & Resources.`);

    // Seed Initial Daily Risks for Today
    const todayStr = new Date().toISOString().split('T')[0];
    const initialTiers = ["Moderate", "Severe", "Low", "Moderate", "Extreme", "Moderate"];
    const initialHVIScores = [54, 78, 32, 58, 91, 62];
    const initialForecastTemps = [41.2, 43.5, 38.8, 41.5, 45.8, 42.0];

    for (let i = 0; i < JAIPUR_WARDS.length; i++) {
      await DailyRisk.findOneAndUpdate(
        { wardId: JAIPUR_WARDS[i].wardId, date: todayStr },
        {
          $set: {
            wardId: JAIPUR_WARDS[i].wardId,
            date: todayStr,
            hvi: initialHVIScores[i],
            forecastTempC: initialForecastTemps[i],
            forecastHumidity: 28,
            riskTier: initialTiers[i],
            isSimulated: false,
            computedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded initial DailyRisk assessments for ${todayStr}.`);

    console.log("\n🎉 Database Seeding Complete!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seed();
