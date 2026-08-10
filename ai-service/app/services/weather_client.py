# ============================================================================
# weather_client.py — Open-Meteo Weather Forecast Integration
# Owner: Member 2 (AI/Data Lead)
# When to build: Day 3
# ============================================================================
#
# PURPOSE:
#   Fetch weather forecast data (temperature, humidity, heat index) from the
#   Open-Meteo API for ward locations. This data is combined with HVI scores
#   in risk_fusion.py to produce the final risk tier.
#
# WHAT TO BUILD:
#
#   1. A function `get_forecast_for_location(lat, lng, days=1)` that:
#      - Calls the Open-Meteo API: https://api.open-meteo.com/v1/forecast
#      - Query params: latitude, longitude, daily=temperature_2m_max,
#        relative_humidity_2m_max, apparent_temperature_max
#      - Returns a dict with: { max_temp_c, max_humidity, heat_index }
#      - Handles errors gracefully (return mock data if API is down)
#
#   2. A function `get_forecast_for_ward(ward)` that:
#      - Takes a ward document (with boundary GeoJSON)
#      - Computes the centroid of the ward polygon (average of coordinates)
#      - Calls get_forecast_for_location with that centroid
#      - NOTE: Open-Meteo doesn't have ward-level granularity, so per-city
#        centroid is an acceptable simplification. Document this in your pitch.
#
#   3. A helper `compute_heat_index(temp_c, humidity_pct)` that:
#      - Implements the standard heat index formula
#      - This is a differentiator — shows judges you understand that
#        "feels like" temperature matters more than raw temperature
#
# API DOCS:
#   https://open-meteo.com/en/docs
#   No API key needed — just make GET requests
#
# EXAMPLE API CALL:
#   GET https://api.open-meteo.com/v1/forecast
#       ?latitude=23.03
#       &longitude=72.58
#       &daily=temperature_2m_max,relative_humidity_2m_max
#       &timezone=Asia/Kolkata
#
# DEPENDENCIES:
#   - requests (already in requirements.txt)
#   - app.config.settings.OPEN_METEO_BASE_URL
#
# MOCK FALLBACK:
#   If the API is unreachable (venue wifi, rate limiting), return a
#   deterministic mock forecast so the demo still works. See gee_client.py
#   for the pattern (it already does this).
#
# CONNECTS TO:
#   - Called by risk_fusion.py (Step 2 of the pipeline)
#   - Called by daily_job.py (as part of the daily recompute)
#
# ============================================================================
