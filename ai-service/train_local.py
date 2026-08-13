import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("jaipur.csv.zip", encoding="latin-1")
# define heatwave condition and treating it as our output column
conditions = [
    (df["HeatIndexC"] < 40),  # Low
    (df["HeatIndexC"] >= 40) & (df["HeatIndexC"] < 45),  # Mild
    (df["HeatIndexC"] >= 45),  # Extreme
]

choices = [0, 1, 2]

df["heatwave_category"] = np.select(conditions, choices, default=0)

print(df["heatwave_category"].value_counts(normalize=True) * 100)

df["date_time"] = pd.to_datetime(df["date_time"], format="mixed", errors="coerce")
df["hours"] = df["date_time"].dt.hour
df["month"] = df["date_time"].dt.month_name()
drop_columns = [
    "totalSnow_cm",
    "uvIndex.1",
    "moon_illumination",
    "moonrise",
    "moonset",
    "sunrise",
    "sunset",
    "FeelsLikeC",
    "HeatIndexC",
    "WindChillC",
]
df = df.drop(columns=drop_columns)

# sort date-time
df = df.sort_values("date_time").reset_index(drop=True)

# cyclical encoding hours
df["hour_sin"] = np.sin(2 * np.pi * df["hours"] / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["hours"] / 24)

month_numbers = df["date_time"].dt.month
# cyclical encoding months
df["month_sin"] = np.sin(2 * np.pi * month_numbers / 12)
df["month_cos"] = np.cos(2 * np.pi * month_numbers / 12)

# Lags
df["temp_lag1hr"] = df["tempC"].shift(1)
df["temp_lag3hr"] = df["tempC"].shift(3)

df["pressure_lag1hr"] = df["pressure"].shift(1)
df["pressure_lag3hr"] = df["pressure"].shift(3)

# rolling stats
df["temp_rolling24hr"] = df["tempC"].rolling(window=24).mean()
df["temp_rolling48hr"] = df["tempC"].rolling(window=48).mean()
df["temp_rolling72hr"] = df["tempC"].rolling(window=72).mean()

df["pressure_rolling24hr"] = df["pressure"].rolling(window=24).mean()
df["pressure_rolling48hr"] = df["pressure"].rolling(window=48).mean()
df["pressure_rolling72hr"] = df["pressure"].rolling(window=72).mean()

df["humidity_rolling24hr"] = df["humidity"].rolling(window=24).mean()
df["humidity_rolling48hr"] = df["humidity"].rolling(window=48).mean()

# rolling stats Extreme
df["temp_max_24hr"] = df["tempC"].rolling(window=24).max()
df["temp_max_48hr"] = df["tempC"].rolling(window=48).max()
df["temp_max_72hr"] = df["tempC"].rolling(window=72).max()

df["temp_min_24hr"] = df["tempC"].rolling(window=24).min()
df["temp_min_48hr"] = df["tempC"].rolling(window=48).min()
df["temp_min_72hr"] = df["tempC"].rolling(window=72).min()

# Diurnal Temperature Range
df["temp_range_24hr"] = df["temp_max_24hr"] - df["temp_min_24hr"]

# drop original hours and month columns
df.drop(columns=["hours", "month"])

df = df.dropna().reset_index(drop=True)


df["year"] = df["date_time"].dt.year

train_df = df[df["year"] <= 2017].copy()

valid_df = df[df["year"] == 2018].copy()

test_df = df[df["year"] >= 2019].copy()

columns_to_drop = ["year", "date_time", "month"]

X_train = train_df.drop(columns=columns_to_drop + ["heatwave_category"])
y_train = train_df["heatwave_category"]

X_valid = valid_df.drop(columns=columns_to_drop + ["heatwave_category"])
y_valid = valid_df["heatwave_category"]

X_test = test_df.drop(columns=columns_to_drop + ["heatwave_category"])
y_test = test_df["heatwave_category"]

from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
y_train_encoded = le.fit_transform(y_train)
y_valid_encoded = le.transform(y_valid)
y_test_encoded = le.transform(y_test)

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


X_train_raw = train_df.drop(columns=["heatwave_category", "year"], errors="ignore")
X_valid_raw = valid_df.drop(columns=["heatwave_category", "year"], errors="ignore")
X_test_raw = test_df.drop(columns=["heatwave_category", "year"], errors="ignore")

import joblib
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
from sklearn.metrics import classification_report

xgb_champion = XGBClassifier(
    n_estimators=241,
    max_depth=7,
    learning_rate=0.040843505134372744,
    random_state=42,
    n_jobs=-1,
)

# Construct the Pipeline
heatwave_pipeline = Pipeline(
    [
        ("feature_engineer", TemporalFeatureEngineer(window_size=72)),
        ("classifier", xgb_champion),
    ]
)

# Fit the Pipeline on Raw Training Data
print("Fitting end-to-end pipeline...")
heatwave_pipeline.fit(X_train_raw, y_train_encoded)

print("Evaluating pipeline on unseen test data...")
y_test_pred_pipeline = heatwave_pipeline.predict(X_test_raw)


# Save the Full Pipeline for Deployment
joblib.dump(heatwave_pipeline, "urban_heatwave_pipeline.pkl")
print("\nSuccess! Pipeline saved as 'urban_heatwave_pipeline.pkl'")
