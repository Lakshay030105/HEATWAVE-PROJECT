// ============================================================================
// db.js — MongoDB Connection via Mongoose
// Owner: Member 1 (Backend Lead)
// When to build: Day 1 (first thing after Atlas cluster is created)
// ============================================================================
//
// PURPOSE:
//   Establish and export the MongoDB connection using Mongoose.
//   All models and routes depend on this being connected first.
//
// WHAT TO BUILD:
//
//   1. A function `connectDB()` that:
//      - Reads MONGO_URI from process.env
//      - Calls mongoose.connect(MONGO_URI)
//      - Logs success: "✅ MongoDB connected to ${mongoose.connection.name}"
//      - Handles connection errors gracefully (log and exit process)
//
//   2. Export the connectDB function (called from server.js on startup)
//
// MONGODB ATLAS SETUP (Do this first on Day 1):
//   - Create a free M0 cluster at https://cloud.mongodb.com
//   - Database name: "urban_heatwave"
//   - Create a database user with read/write access
//   - Whitelist 0.0.0.0/0 for demo (allows any IP — ONLY for hackathon)
//   - Copy the connection string into backend/.env as MONGO_URI
//   - Share the MONGO_URI with Member 2 for the AI service .env
//
// MONGOOSE OPTIONS:
//   mongoose.connect(uri) is sufficient — Mongoose 8+ handles options
//   automatically. No need for useNewUrlParser or useUnifiedTopology.
//
// ============================================================================
