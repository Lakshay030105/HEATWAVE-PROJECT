import os
from pathlib import Path
from typing import Annotated, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from dotenv import load_dotenv
from pymongo import MongoClient
import requests
import ee
import joblib

from app.services.hvi_model import compute_hvi

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "urban_heatwave")
GEE_PROJECT_ID = os.getenv("GEE_PROJECT_ID", "heatwavemitigationsystem")
OPEN_METEO_BASE_URL = os.getenv(
    "OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1"
).rstrip("/")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]

# 1. Initialize FastAPI
app = FastAPI(
    title="SIH Heatwave ML API",
    description="API to fetch Jaipur GEE live data, run ML predictions, and store results in MongoDB.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin


class TemporalFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self, window_size=72):
        self.window_size = window_size
        self.history_buffer = None

        # Useless Features
        self.useless_features = ["visibility", "precipMM", "uvIndex", "sunHour"]

    def fit(self, X, y=None):
        # Store last 72 hours of the training data
        self.history_buffer = X.tail(self.window_size).copy()
        return self

    def transform(self, X):
        X_copy = X.copy()

        if self.history_buffer is not None:
            combined = pd.concat([self.history_buffer, X_copy], ignore_index=True)
        else:
            combined = X_copy

        # datetime formatting
        combined["date_time"] = pd.to_datetime(combined["date_time"])
        if "hours" not in combined.columns:
            combined["hours"] = combined["date_time"].dt.hour

        # Cyclical Encoding
        combined["hour_sin"] = np.sin(2 * np.pi * combined["hours"] / 24)
        combined["hour_cos"] = np.cos(2 * np.pi * combined["hours"] / 24)

        # Time-Series Lags
        combined["temp_lag1hr"] = combined["tempC"].shift(1)
        combined["temp_lag3hr"] = combined["tempC"].shift(3)
        combined["pressure_lag1hr"] = combined["pressure"].shift(1)
        combined["pressure_lag3hr"] = combined["pressure"].shift(3)

        # Rolling Stats
        combined["temp_rolling24hr"] = (
            combined["tempC"].rolling(window=24, min_periods=1).mean()
        )
        combined["temp_rolling48hr"] = (
            combined["tempC"].rolling(window=48, min_periods=1).mean()
        )
        combined["temp_rolling72hr"] = (
            combined["tempC"].rolling(window=72, min_periods=1).mean()
        )

        combined["pressure_rolling24hr"] = (
            combined["pressure"].rolling(window=24, min_periods=1).mean()
        )
        combined["pressure_rolling48hr"] = (
            combined["pressure"].rolling(window=48, min_periods=1).mean()
        )
        combined["pressure_rolling72hr"] = (
            combined["pressure"].rolling(window=72, min_periods=1).mean()
        )

        combined["humidity_rolling24hr"] = (
            combined["humidity"].rolling(window=24, min_periods=1).mean()
        )
        combined["humidity_rolling48hr"] = (
            combined["humidity"].rolling(window=48, min_periods=1).mean()
        )

        # Rolling Extreme & Diurnal Range
        combined["temp_max_24hr"] = (
            combined["tempC"].rolling(window=24, min_periods=1).max()
        )
        combined["temp_max_48hr"] = (
            combined["tempC"].rolling(window=48, min_periods=1).max()
        )
        combined["temp_max_72hr"] = (
            combined["tempC"].rolling(window=72, min_periods=1).max()
        )

        combined["temp_min_24hr"] = (
            combined["tempC"].rolling(window=24, min_periods=1).min()
        )
        combined["temp_range_24hr"] = (
            combined["temp_max_24hr"] - combined["temp_min_24hr"]
        )

        # Cleanup Useless and Raw Columns
        columns_to_drop = self.useless_features + ["date_time", "month", "year"]
        combined = combined.drop(columns=columns_to_drop, errors="ignore")

        output = combined.tail(len(X_copy)).copy()
        if self.history_buffer is not None:
            new_buffer = pd.concat([self.history_buffer, X_copy], ignore_index=True)
            self.history_buffer = new_buffer.tail(self.window_size).copy()

        return output


import __main__

__main__.TemporalFeatureEngineer = TemporalFeatureEngineer


# 2. Initialize Google Earth Engine (optional — the service degrades to weather-only)
try:
    ee.Initialize(project=GEE_PROJECT_ID)
    GEE_READY = True
    print("Google Earth Engine initialized successfully!")
except Exception as e:
    GEE_READY = False
    print(f"GEE Initialization failed, falling back to weather data only: {e}")

# 3. Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]
predictions_collection = db["ml_results"]
wards_collection = db["wards"]
daily_risk_collection = db["dailyrisks"]

# 4. Load the trained pipeline
MODEL_PATH = BASE_DIR / "saved_models" / "urban_heatwave_pipeline.pkl"

try:
    heatwave_pipeline = joblib.load(MODEL_PATH)
    print("Urban Heatwave Pipeline loaded successfully!")
except Exception as e:
    heatwave_pipeline = None
    print(f"Failed to load pipeline model: {e}")

# Model classes mapped onto the riskTier enum the backend/dashboard use
RISK_TIER_MAP = {0: "Low", 1: "Severe", 2: "Extreme"}
PREDICTION_LABELS = {
    0: "Low (No Heatwave)",
    1: "Mild Heatwave",
    2: "Extreme Heatwave",
}


# 5. Define the Data Contract
class FrontendRequest(BaseModel):
    latitude: Annotated[
        float,
        Field(
            description="Latitude coordinate in Jaipur",
            ge=-90.0,
            le=90.0,
            examples=[26.9124],
        ),
    ]
    longitude: Annotated[
        float,
        Field(
            description="Longitude coordinate in Jaipur",
            ge=-180.0,
            le=180.0,
            examples=[75.7873],
        ),
    ]


# 6. Helper function to fetch live satellite data from GEE
def fetch_gee_data(lat: float, lon: float) -> Optional[float]:
    """Return the latest MODIS land surface temperature, or None when unavailable."""
    if not GEE_READY:
        return None

    try:
        point = ee.Geometry.Point([lon, lat])

        dataset = (
            ee.ImageCollection("MODIS/061/MOD11A1")
            .filterBounds(point)
            .select("LST_Day_1km")
            .sort("system:time_start", False)
            .first()
        )

        sample = dataset.reduceRegion(
            reducer=ee.Reducer.first(), geometry=point, scale=1000
        ).getInfo()

        raw_lst = sample.get("LST_Day_1km")
        if raw_lst is None:
            return None
        return round(raw_lst * 0.02 - 273.15, 2)

    except Exception as e:
        print(f"GEE fetch failed for ({lat}, {lon}), using weather temperature: {e}")
        return None


def fetch_live_weather(lat, lon):
    """Fetches 72 hours of historical + current live weather for time-series features."""
    url = (
        f"{OPEN_METEO_BASE_URL}/forecast?latitude={lat}&longitude={lon}"
        f"&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,"
        f"surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m"
        f"&daily=temperature_2m_max,temperature_2m_min"
        f"&past_days=3&forecast_days=1&timezone=auto"
    )

    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()

        # 1. Build the Hourly DataFrame
        df = pd.DataFrame(data["hourly"])
        df.rename(
            columns={
                "time": "date_time",
                "temperature_2m": "tempC",
                "dew_point_2m": "DewPointC",
                "wind_gusts_10m": "WindGustKmph",
                "cloud_cover": "cloudcover",
                "relative_humidity_2m": "humidity",
                "surface_pressure": "pressure",
                "wind_direction_10m": "winddirDegree",
                "wind_speed_10m": "windspeedKmph",
            },
            inplace=True,
        )
        df["date_time"] = pd.to_datetime(df["date_time"])

        # 2. Merge Daily Max/Min Temperatures
        # FIX: Use .date directly on the DatetimeIndex object
        df["date"] = df["date_time"].dt.date
        daily_df = pd.DataFrame(
            {
                "date": pd.to_datetime(data["daily"]["time"]).date,
                "maxtempC": data["daily"]["temperature_2m_max"],
                "mintempC": data["daily"]["temperature_2m_min"],
            }
        )
        df = df.merge(daily_df, on="date", how="left")
        df.drop(columns=["date"], inplace=True)

        # 3. Trim to end exactly at the current hour (72 hours total)
        current_time = pd.Timestamp.now().floor("h")
        df = df[df["date_time"] <= current_time].tail(72).reset_index(drop=True)

        return df

    except Exception as e:
        print(f"Open-Meteo API failed: {e}. Generating 72-hour safe fallback data.")
        dates = pd.date_range(end=pd.Timestamp.now().floor("h"), periods=72, freq="h")
        fallback_df = pd.DataFrame(
            {
                "date_time": dates,
                "tempC": 31.9,
                "maxtempC": 35.0,
                "mintempC": 26.0,
                "DewPointC": 18.0,
                "WindGustKmph": 15.0,
                "cloudcover": 20,
                "humidity": 45,
                "pressure": 1008,
                "winddirDegree": 240,
                "windspeedKmph": 12,
            }
        )
        return fallback_df


def run_prediction(lat: float, lon: float) -> dict:
    """Run the pipeline on 72h of live weather, with the GEE temperature when available."""
    if heatwave_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction model is not loaded. Check ai-service startup logs.",
        )

    input_df = fetch_live_weather(lat, lon)

    # Inject the satellite temperature into the current hour when GEE is reachable
    gee_temp = fetch_gee_data(lat, lon)
    final_temp = (
        gee_temp if gee_temp is not None else input_df.at[input_df.index[-1], "tempC"]
    )
    input_df.at[input_df.index[-1], "tempC"] = final_temp

    raw_predictions = heatwave_pipeline.predict(input_df)
    raw_class_integer = int(raw_predictions[-1])

    return {
        "latitude": lat,
        "longitude": lon,
        "temperature_celsius": float(final_temp),
        "humidity": float(input_df.at[input_df.index[-1], "humidity"]),
        "prediction_class": raw_class_integer,
        "prediction": PREDICTION_LABELS.get(raw_class_integer, "Unknown"),
        "risk_tier": RISK_TIER_MAP.get(raw_class_integer, "Low"),
        "gee_used": gee_temp is not None,
        "status": "Success",
    }


def ward_centroid(ward: dict) -> Optional[tuple]:
    """Average the outer ring of a ward's GeoJSON polygon into a (lat, lon) point."""
    try:
        ring = ward["boundary"]["coordinates"][0]
    except (KeyError, IndexError, TypeError):
        return None

    points = [p for p in ring if isinstance(p, (list, tuple)) and len(p) >= 2]
    if not points:
        return None

    lon = sum(p[0] for p in points) / len(points)
    lat = sum(p[1] for p in points) / len(points)
    return lat, lon


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": heatwave_pipeline is not None,
        "gee_ready": GEE_READY,
        "database": MONGO_DB_NAME,
    }


@app.post("/api/predict")
async def get_prediction(request: FrontendRequest):
    prediction_result = run_prediction(request.latitude, request.longitude)
    predictions_collection.insert_one(prediction_result.copy())
    return prediction_result


@app.post("/internal/recompute")
async def recompute_daily_risk():
    """Recompute today's risk for every ward and upsert it into the shared dailyrisks collection."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    updated, skipped = [], []

    for ward in wards_collection.find({}):
        centroid = ward_centroid(ward)
        if centroid is None:
            skipped.append({"wardId": ward.get("wardId"), "reason": "no boundary"})
            continue

        lat, lon = centroid
        prediction = run_prediction(lat, lon)
        hvi = compute_hvi(
            {
                "lst_temp": prediction["temperature_celsius"],
                "pct_elderly": ward.get("pctElderly", 0),
                "pct_outdoor_workers": ward.get("pctOutdoorWorkers", 0),
                "green_cover_pct": ward.get("greenCoverPct", 0),
            }
        )

        daily_risk_collection.update_one(
            {"wardId": ward["wardId"], "date": today},
            {
                "$set": {
                    "hvi": hvi,
                    "riskTier": prediction["risk_tier"],
                    "forecastTempC": prediction["temperature_celsius"],
                    "forecastHumidity": prediction["humidity"],
                    "computedAt": datetime.now(timezone.utc),
                    "isSimulated": False,
                }
            },
            upsert=True,
        )
        updated.append(
            {
                "wardId": ward["wardId"],
                "riskTier": prediction["risk_tier"],
                "hvi": hvi,
            }
        )

    return {
        "success": True,
        "date": today,
        "updated": updated,
        "skipped": skipped,
        "message": f"Recomputed risk for {len(updated)} ward(s)",
    }
