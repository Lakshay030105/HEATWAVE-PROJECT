# ============================================================================
# schemas.py — Pydantic Models for Request/Response Validation
# Owner: Member 2 (AI/Data Lead)
# When to build: Day 1-2
# ============================================================================
#
# PURPOSE:
#   Define Pydantic models that mirror the MongoDB document shapes.
#   These are used for FastAPI request/response validation and
#   for type-safe data handling within the AI service.
#
# WHAT TO BUILD:
#
#   1. class WardSchema(BaseModel):
#      - wardId: str
#      - name: str
#      - cityId: str
#      - boundary: dict          (GeoJSON Polygon)
#      - population: int
#      - pctElderly: float       (0.0 – 1.0)
#      - pctOutdoorWorkers: float
#      - greenCoverPct: float
#
#   2. class DailyRiskSchema(BaseModel):
#      - wardId: str
#      - date: str               (ISO date "2026-08-10")
#      - hvi: float              (0–100)
#      - forecastTempC: float
#      - forecastHumidity: float
#      - riskTier: str           ("Low" | "Moderate" | "Severe" | "Extreme")
#      - computedAt: datetime
#      - isSimulated: bool = False
#
#   3. class RecomputeResponse(BaseModel):
#      - success: bool
#      - message: str
#      - wards_processed: int
#      - computed_at: str
#
#   4. class ForecastData(BaseModel):
#      - max_temp_c: float
#      - max_humidity: float
#      - heat_index: Optional[float]
#
#   5. class HVIResult(BaseModel):
#      - wardId: str
#      - hvi_score: float
#      - lst_temp: Optional[float]
#      - factors: dict            (breakdown of each weight contribution)
#
# DEPENDENCIES:
#   - pydantic (BaseModel, Field, Optional)
#   - datetime
#
# REFERENCE:
#   See docs/API_CONTRACTS.md for the full MongoDB schema definitions.
#   These Pydantic models should mirror those shapes exactly.
#
# ============================================================================
