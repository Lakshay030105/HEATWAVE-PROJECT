# ============================================================================
# risk_fusion.py — HVI + Weather Forecast → Final Risk Tier
# Owner: Member 2 (AI/Data Lead)
# When to build: Day 3
# ============================================================================
#
# PURPOSE:
#   Combine the HVI score (vulnerability) with the weather forecast (hazard)
#   to produce a final Risk Tier (Low/Moderate/Severe/Extreme) for each ward.
#   This is the step that writes the final decision to MongoDB.
#
# WHAT TO BUILD:
#
#   1. A function `compute_risk_tier(hvi_score, forecast)` that:
#      - Takes the HVI score (0-100) from hvi_model.py
#      - Takes the forecast dict from weather_client.py
#      - Computes a combined score:
#
#        combined = 0.6 * hvi_score + 0.4 * forecast_severity
#
#        Where forecast_severity is derived from:
#        - temp > 45°C → severity 100
#        - temp > 42°C → severity 75
#        - temp > 39°C → severity 50
#        - temp > 35°C → severity 25
#        - temp <= 35°C → severity 0
#        (Adjust thresholds based on your target city's climate)
#
#      - Maps combined score to tier:
#        0-25  → "Low"
#        26-50 → "Moderate"
#        51-75 → "Severe"
#        76-100 → "Extreme"
#
#      - Returns: { riskTier, combinedScore }
#
#   2. A function `run_full_pipeline()` that:
#      - This is the MAIN ENTRY POINT called by the scheduler and
#        the /internal/recompute endpoint
#      - Step 1: Load all wards from MongoDB
#      - Step 2: For each ward, compute HVI (calls hvi_model.py)
#      - Step 3: For each ward, get forecast (calls weather_client.py)
#      - Step 4: For each ward, compute risk tier (calls compute_risk_tier)
#      - Step 5: Write DailyRisk documents to MongoDB
#      - Returns: { wards_processed: N }
#
#      IMPORTANT: This function is imported by app/routers/risk.py
#      (already built) — make sure the function signature matches:
#        async def run_full_pipeline() -> dict
#
#   3. A function `write_daily_risks(risks)` that:
#      - Takes a list of risk results
#      - Writes/upserts DailyRisk documents to MongoDB
#      - Uses pymongo to connect (use MONGO_URI from config)
#      - Each doc: { wardId, date, hvi, forecastTempC, forecastHumidity,
#                     riskTier, computedAt, isSimulated: false }
#
# IMPORTANT DESIGN NOTE:
#   The 0.6/0.4 split between HVI and forecast is what makes this project
#   innovative. A pure weather system gives the same warning to everyone.
#   By weighting vulnerability at 60%, a ward with elderly residents and
#   no green cover gets a "Severe" rating at 40°C while a well-shaded
#   affluent ward gets "Moderate" at the same temperature.
#   SAY THIS IN YOUR PITCH.
#
# DEPENDENCIES:
#   - pymongo (for MongoDB writes)
#   - app.config.settings (for MONGO_URI)
#   - app.services.hvi_model (for HVI computation)
#   - app.services.weather_client (for forecast data)
#
# CONNECTS TO:
#   - Called by app/routers/risk.py POST /internal/recompute
#   - Called by app/scheduler/daily_job.py
#   - Writes to MongoDB → Express backend reads these docs
#   - Express riskWatcher.cron.js watches for Severe/Extreme tiers
#
# ============================================================================
