# ============================================================================
# hvi_model.py — Heat Vulnerability Index (HVI) Calculation
# Owner: Member 2 (AI/Data Lead)
# When to build: Day 2
# ============================================================================
#
# PURPOSE:
#   Compute a Heat Vulnerability Index (0-100) for each ward based on
#   satellite temperature data and demographic factors. This is the core
#   "intelligence" of the system — the thing that makes your project
#   different from a generic weather app.
#
# WHAT TO BUILD:
#
#   1. A function `compute_hvi(ward_data)` that takes a dict with:
#      - lst_temp: Land Surface Temperature in Celsius (from gee_client.py)
#      - pct_elderly: fraction of population aged 65+ (from census data)
#      - pct_outdoor_workers: fraction working outdoors (from census data)
#      - green_cover_pct: fraction of ward area with vegetation (from census/GEE)
#
#      And returns a float (0-100) using the weighted formula:
#
#        HVI = w1 * normalize(lst_temp) +
#              w2 * normalize(pct_elderly) +
#              w3 * normalize(pct_outdoor_workers) +
#              w4 * normalize(1 - green_cover_pct)
#
#      Weights are in config.py:
#        HVI_WEIGHT_LST = 0.35
#        HVI_WEIGHT_ELDERLY = 0.25
#        HVI_WEIGHT_OUTDOOR = 0.25
#        HVI_WEIGHT_GREEN = 0.15
#
#   2. A function `normalize(value, min_val, max_val)` that:
#      - Scales any value to 0-100 range
#      - Use min-max normalization: (value - min) / (max - min) * 100
#      - For LST: typical range is 30-50°C in Indian summer
#      - For percentages: range is 0.0 - 1.0
#
#   3. A function `compute_hvi_for_all_wards(wards)` that:
#      - Takes a list of ward documents from MongoDB
#      - For each ward, fetches LST via gee_client.py
#      - Computes HVI using the formula above
#      - Returns a list of { wardId, hvi_score } dicts
#
#   4. A function `get_lst_stats(lst_values)` that:
#      - Computes mean and standard deviation of all ward LST values
#      - Returns z-scores for each ward (how many SDs above/below mean)
#      - Using z-scores instead of raw temp makes the model city-agnostic
#
# WHY THIS APPROACH:
#   - Judges will ask "how does your model work?" — you need to explain
#     the formula in ONE sentence: "We weight four factors: how hot the
#     ground is, how many elderly people live there, how many work outdoors,
#     and how little green cover there is."
#   - This is deliberately NOT a neural network. An explainable model
#     beats a black box in a hackathon Q&A.
#   - Tune the weights in notebooks/ by testing different combinations
#     and seeing which produces the most "visually correct" map coloring.
#
# DEPENDENCIES:
#   - pandas (for data manipulation)
#   - scikit-learn (for MinMaxScaler if you want, or just do it manually)
#   - app.config.settings (for weights)
#   - app.services.gee_client (for LST data)
#
# CONNECTS TO:
#   - Called by risk_fusion.py (provides HVI scores)
#   - Called by daily_job.py (as part of daily pipeline)
#   - Results written to MongoDB dailyrisks collection (hvi field)
#
# ============================================================================

import os

# Weights (override via env, defaults documented in .env.example)
HVI_WEIGHT_LST = float(os.getenv("HVI_WEIGHT_LST", 0.35))
HVI_WEIGHT_ELDERLY = float(os.getenv("HVI_WEIGHT_ELDERLY", 0.25))
HVI_WEIGHT_OUTDOOR = float(os.getenv("HVI_WEIGHT_OUTDOOR", 0.25))
HVI_WEIGHT_GREEN = float(os.getenv("HVI_WEIGHT_GREEN", 0.15))

# Land surface temperature range used to normalise into 0-1
LST_MIN_C = 25.0
LST_MAX_C = 50.0


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def compute_hvi(ward_data: dict) -> float:
    """Weighted Heat Vulnerability Index (0-100) for a ward.

    Expects lst_temp (Celsius), pct_elderly, pct_outdoor_workers and
    green_cover_pct as fractions between 0 and 1.
    """
    lst = _clamp(
        (float(ward_data.get("lst_temp", LST_MIN_C)) - LST_MIN_C)
        / (LST_MAX_C - LST_MIN_C)
    )
    elderly = _clamp(float(ward_data.get("pct_elderly", 0)))
    outdoor = _clamp(float(ward_data.get("pct_outdoor_workers", 0)))
    green_deficit = 1 - _clamp(float(ward_data.get("green_cover_pct", 0)))

    score = (
        HVI_WEIGHT_LST * lst
        + HVI_WEIGHT_ELDERLY * elderly
        + HVI_WEIGHT_OUTDOOR * outdoor
        + HVI_WEIGHT_GREEN * green_deficit
    )
    return round(score * 100, 2)
