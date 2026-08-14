from typing import Annotated
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import os
import requests
import joblib
import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from dotenv import load_dotenv

# Safe optional GEE import
try:
    import ee
except ImportError:
    ee = None

load_dotenv()

# 1. Initialize FastAPI
app = FastAPI(
    title="SIH Heatwave ML API",
    description="API to fetch Jaipur GEE live data, run ML predictions, and store results in MongoDB.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


# Expose custom transformer dynamically to __main__ for joblib/pickle unpickling
import sys
if "__main__" in sys.modules:
    setattr(sys.modules["__main__"], "TemporalFeatureEngineer", TemporalFeatureEngineer)


# 2. Initialize Google Earth Engine
gee_available = False
if ee is not None:
    try:
        ee.Initialize(project="heatwavemitigationsystem")
        gee_available = True
        print("Google Earth Engine initialized successfully!")
    except Exception as e:
        print(f"GEE Initialization notice: {e}. Live predictions will use Open-Meteo data.")

# 3. Connect to MongoDB Atlas (Graceful Fallback)
predictions_collection = None
MONGO_URI = os.getenv("MONGO_URI")
if MONGO_URI:
    try:
        from pymongo import MongoClient
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        db = client["sih_project"]
        predictions_collection = db["ml_results"]
    except Exception as e:
        print(f"MongoDB connection notice: {e}")

# 4. Load Pipeline Model
heatwave_pipeline = None
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CANDIDATE_PATHS = [
    os.path.join(BASE_DIR, "saved_models", "urban_heatwave_pipeline.pkl"),
    os.path.join(os.getcwd(), "saved_models", "urban_heatwave_pipeline.pkl"),
    "saved_models/urban_heatwave_pipeline.pkl"
]

for p in CANDIDATE_PATHS:
    if os.path.exists(p):
        try:
            heatwave_pipeline = joblib.load(p)
            print(f"Urban Heatwave Pipeline loaded successfully from {p}!")
            break
        except Exception as e:
            print(f"Failed to load pipeline model from {p}: {e}")


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
def fetch_gee_data(lat: float, lon: float) -> float:
    if not gee_available or ee is None:
        return 0.0

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

        raw_lst = sample.get("LST_Day_1km") if sample else None
        lst_celsius = (raw_lst * 0.02 - 273.15) if raw_lst is not None else 0.0
        return round(lst_celsius, 2)
    except Exception as e:
        print(f"GEE Fetch notice: {e}. Falling back to Open-Meteo temperature.")
        return 0.0


def fetch_live_weather(lat: float, lon: float) -> pd.DataFrame:
    """Fetches 72 hours of historical + current live weather for time-series features."""
    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
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
        df["date"] = df["date_time"].dt.date
        daily_dates = [pd.to_datetime(t).date() for t in data["daily"]["time"]]
        daily_df = pd.DataFrame(
            {
                "date": daily_dates,
                "maxtempC": data["daily"]["temperature_2m_max"],
                "mintempC": data["daily"]["temperature_2m_min"],
            }
        )
        df = df.merge(daily_df, on="date", how="left")
        df.drop(columns=["date"], inplace=True)

        # 3. Trim to end exactly at the current hour (72 hours total)
        current_time = pd.Timestamp.now().floor("h")
        df = df[df["date_time"] <= current_time].tail(72).reset_index(drop=True)

        if len(df) < 72:
            raise ValueError(f"Insufficient weather records: {len(df)} rows")

        return df

    except Exception as e:
        print(f"Open-Meteo API notice: {e}. Generating 72-hour safe fallback data.")
        dates = pd.date_range(end=pd.Timestamp.now().floor("h"), periods=72, freq="h")
        fallback_df = pd.DataFrame(
            {
                "date_time": dates,
                "tempC": 38.5,
                "maxtempC": 42.0,
                "mintempC": 28.0,
                "DewPointC": 18.0,
                "WindGustKmph": 15.0,
                "cloudcover": 20,
                "humidity": 35,
                "pressure": 1008,
                "winddirDegree": 240,
                "windspeedKmph": 12,
            }
        )
        return fallback_df


@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "SIH Heatwave ML API",
        "model_loaded": heatwave_pipeline is not None,
        "gee_available": gee_available,
        "database_connected": predictions_collection is not None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post("/api/predict")
async def get_prediction(request: FrontendRequest):
    if heatwave_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="Machine learning model is currently unavailable or failed to load.",
        )

    # 1. Fetch exactly 72 hours of live weather data as a DataFrame
    input_df = fetch_live_weather(request.latitude, request.longitude)

    # 2. Try to get Google Earth Engine satellite temp
    gee_temp = fetch_gee_data(request.latitude, request.longitude)

    # 3. Inject GEE Temp into the CURRENT hour (the very last row) if it succeeded
    final_temp = (
        gee_temp if gee_temp != 0.0 else input_df.at[input_df.index[-1], "tempC"]
    )
    input_df.at[input_df.index[-1], "tempC"] = final_temp

    # 4. Pass the entire 72-hour DataFrame to the pipeline!
    raw_predictions = heatwave_pipeline.predict(input_df)

    # 5. Extract the raw integer prediction (0, 1, or 2) for the current live hour
    raw_class_integer = int(raw_predictions[-1])

    # 6. Map exactly according to your original np.select definition!
    # 0 = Low (<40), 1 = Mild (40-45), 2 = Extreme (>=45)
    custom_label_map = {
        0: "Low (No Heatwave)",
        1: "Mild Heatwave",
        2: "Extreme Heatwave",
    }

    final_prediction = custom_label_map.get(raw_class_integer, "Unknown")

    # 7. Construct final response payload
    prediction_result = {
        "latitude": request.latitude,
        "longitude": request.longitude,
        "temperature_celsius": float(final_temp),
        "prediction": final_prediction,
        "status": "Success",
    }

    # 8. Save to MongoDB Atlas if connected
    if predictions_collection is not None:
        try:
            predictions_collection.insert_one(prediction_result.copy())
        except Exception as e:
            print(f"MongoDB write notice: {e}")

    return prediction_result

