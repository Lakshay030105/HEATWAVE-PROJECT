# Jaipur Urban Heatwave Early Warning & Vulnerability Monitoring System
## Complete System Architecture, AI Model Deep-Dive & Engineering Handover Document

> **Document Purpose:** Complete technical architecture reference and team handover guide for the Smart India Hackathon (SIH) project. Designed for team onboarding, deep technical comprehension, and conversion into an explanatory team PDF / slide deck.
> **Date:** August 14, 2026  
> **Target Municipality:** Jaipur Nagar Nigam (Heritage & Greater), Rajasthan  
> **Tech Stack:** Python 3.11 (FastAPI, XGBoost, Scikit-Learn, Earth Engine) + Node.js (Express, Mongoose, node-cron, Twilio) + React 18 (Vite, Tailwind CSS v4, Leaflet, Recharts) + MongoDB Atlas.

---

# Table of Contents
1. [Executive Architecture Overview](#1-executive-architecture-overview)
2. [Data Flow & Lifecycle ("Who Pushes Data Where")](#2-data-flow--lifecycle-who-pushes-data-where)
3. [AI & Machine Learning Engine Deep-Dive](#3-ai--machine-learning-engine-deep-dive)
   - [3.1 Model Architecture & Pipeline](#31-model-architecture--pipeline)
   - [3.2 Custom Temporal Feature Engineering](#32-custom-temporal-feature-engineering)
   - [3.3 Heat Vulnerability Index (HVI) Mathematical Model](#33-heat-vulnerability-index-hvi-mathematical-model)
   - [3.4 Risk Fusion Engine](#34-risk-fusion-engine)
4. [Role & Mechanics of the Backend (Express.js)](#4-role--mechanics-of-the-backend-expressjs)
   - [4.1 API Gateway & Data Provider](#41-api-gateway--data-provider)
   - [4.2 The 30-Second Risk Watcher Daemon](#42-the-30-second-risk-watcher-daemon)
   - [4.3 Multi-Channel Alert Dispatch & Deduplication](#43-multi-channel-alert-dispatch--deduplication)
5. [Exhaustive Folder-by-Folder & File-by-File Breakdown](#5-exhaustive-folder-by-folder--file-by-file-breakdown)
   - [5.1 AI Service (`/ai-service`)](#51-ai-service-ai-service)
   - [5.2 Backend API (`/backend`)](#52-backend-api-backend)
   - [5.3 Frontend Client (`/frontend`)](#53-frontend-client-frontend)
   - [5.4 Helper Scripts (`/scripts`)](#54-helper-scripts-scripts)
   - [5.5 Documentation (`/docs`)](#55-documentation-docs)
6. [Database Schema & Data Contracts](#6-database-schema--data-contracts)
7. [The Live Simulation & Demo Sequence](#7-the-live-simulation--demo-sequence)
8. [Summary of Team Roles & Next Actions](#8-summary-of-team-roles--next-actions)

---

# 1. Executive Architecture Overview

Most heatwave warnings across Indian cities today are **generic and city-wide** (e.g., "Jaipur is on Yellow Alert"). This ignores microclimatic realities: an elderly resident in a congested, non-vegetated slum experiences heat stress very differently from someone in a green, air-conditioned neighborhood.

Our solution implements a **4-tier microservices architecture** that turns raw satellite and meteorological data into **ward-level hyper-local risk tiers** and automatically dispatches **targeted, multi-channel alerts**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   HIGH-LEVEL ARCHITECTURE                                  │
│                                                                                            │
│   [ MODIS LST (Satellite) ]       [ Open-Meteo (Weather) ]     [ Census Demographics ]    │
│               │                              │                             │               │
│               ▼                              ▼                             ▼               │
│   ┌────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         TIER 1: AI SERVICE (FastAPI — Port 8000)                   │   │
│   │  • TemporalFeatureEngineer: 72h rolling lag, diurnal cycles, delta trends          │   │
│   │  • XGBoost Pipeline: Multi-class heat classification (Low / Mild / Extreme)       │   │
│   │  • HVI Formula: Sensitivity + Exposure - Adaptive Capacity                         │   │
│   │  • Risk Fusion: Combines HVI + Forecast → DailyRisk Tiers                          │   │
│   └──────────────────────────────────────────┬─────────────────────────────────────────┘   │
│                                              │ Writes daily records                        │
│                                              ▼                                             │
│   ┌────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                      TIER 2: SHARED DATABASE (MongoDB Atlas)                       │   │
│   │  Collections: [ wards ]  [ dailyrisks ]  [ alertlogs ]  [ resources ] [ feedback ] │   │
│   └──────────────────────────────────────────┬─────────────────────────────────────────┘   │
│                                              │                                             │
│                      ┌───────────────────────┴───────────────────────┐                     │
│                      ▼                                               ▼                     │
│   ┌─────────────────────────────────────────┐     ┌────────────────────────────────────┐   │
│   │  TIER 3: BACKEND (Express — Port 5000)  │     │  TIER 4: FRONTEND (React — Pt 5173)│   │
│   │  • REST API Gateway                     │     │  • Leaflet Choropleth Map          │   │
│   │  • 30s node-cron Watcher Daemon         │◄────┤  • Authority Analytics Dashboard   │   │
│   │  • Twilio SMS / Voice Dispatcher        │     │  • Emergency Shelter Directory     │   │
│   │  • Firebase Push Notification Service   │     │  • Citizen Risk Portal & Reports   │   │
│   │  • Simulation Engine (Demo Button)      │     │  • Live Simulation Toggle Button   │   │
│   └─────────────────────────────────────────┘     └────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 2. Data Flow & Lifecycle ("Who Pushes Data Where")

Here is the exact step-by-step lifecycle of how data flows across the system:

```
[ Step 1: Data Ingestion ]
  • Open-Meteo API provides 72-hour historical hourly records + 24-hour forecast.
  • Google Earth Engine (MODIS MOD11A1 satellite) provides 1km Land Surface Temperature (LST).
  • Census 2011 files provide demographic sensitivity (Elderly %, Outdoor Worker %, Green Cover %).

[ Step 2: AI Processing & Inference ]
  • TemporalFeatureEngineer builds time-series sliding windows (rolling max, mean, dew point swing).
  • XGBoost Pipeline predicts heat severity class.
  • hvi_model.py calculates ward Heat Vulnerability Index (0–100).
  • risk_fusion.py merges HVI + Forecast into a discrete risk tier (Low, Moderate, Severe, Extreme).
  • AI Service (or seed job) writes DailyRisk documents into MongoDB.

[ Step 3: Database Storage ]
  • MongoDB stores DailyRisk { wardId: "JPR-W02", date: "2026-08-14", riskTier: "Extreme", hvi: 95 }.

[ Step 4: Background Watcher & Alerting ]
  • Express background daemon (riskWatcher.cron.js) polls MongoDB every 30 seconds.
  • When a Severe or Extreme risk record is found:
      - Checks alertlogs to verify if an alert was already sent to this recipient today.
      - If new, dispatches Twilio SMS and/or Firebase Push.
      - Writes a record into alertlogs with a unique dedupeKey (`wardId-date-tier-phone`).

[ Step 5: Frontend Visualization ]
  • React client calls Express API: `GET /api/wards` and `GET /api/risk/latest`.
  • Leaflet map renders ward polygons, colored in real-time by their risk tier.
  • Authority dashboard updates KPI counters and cooling center availability gauges.

[ Step 6: Simulation / Demo Loop ]
  • User clicks "Simulate Heatwave" in Frontend → Calls `POST /api/simulate`.
  • Express writes an Extreme DailyRisk document with `isSimulated: true`.
  • Watcher picks it up within 30 seconds → Sends SMS → Map recolors to Red on stage!
```

---

# 3. AI & Machine Learning Engine Deep-Dive

### 3.1 Model Architecture & Pipeline
The AI service uses an **end-to-end Scikit-Learn Pipeline** (`saved_models/urban_heatwave_pipeline.pkl`) that encapsulates preprocessing, temporal feature extraction, and an **XGBoost Classifier**:

```python
Pipeline(steps=[
    ('feature_engineer', TemporalFeatureEngineer(window_size=72)),
    ('classifier', XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.8,
        objective='multi:softprob',
        num_class=3
    ))
])
```

- **Input:** 72 consecutive hours of hourly meteorological parameters (temperature, humidity, dew point, wind gust, surface pressure, cloud cover).
- **Output:** Categorical heatwave classification:
  - `0`: **Low (No Heatwave)** — Typical seasonal temperature (<40°C).
  - `1`: **Mild Heatwave** — Elevated temperature (40°C–45°C), moderate heat stress.
  - `2`: **Extreme Heatwave** — Critical danger zone (≥45°C or high Heat Index), immediate mortality risk.

---

### 3.2 Custom Temporal Feature Engineering
Raw instantaneous temperature is deceptive. Human heat stress accumulates over time (e.g., 3 consecutive hot nights prevent nocturnal physiological cooling). 

The custom `TemporalFeatureEngineer` transformer computes **domain-specific lag features**:
1. **Rolling Maximum & Mean Temperatures:** `tempC_rolling_max_24h`, `tempC_rolling_mean_72h`.
2. **Diurnal Temperature Range (DTR):** Difference between daily maximum and minimum temperatures.
3. **Thermal Accumulation (Degree Hours):** Cumulative hours where temperature exceeds 40°C threshold.
4. **Dew Point & Vapor Pressure Deficit:** Captures evaporative cooling impairment (humidity trap).

```python
class TemporalFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self, window_size=72):
        self.window_size = window_size

    def transform(self, X):
        # Computes 72h rolling statistics, lag terms, and rate of diurnal heating
        ...
```

---

### 3.3 Heat Vulnerability Index (HVI) Mathematical Model
The **Heat Vulnerability Index (HVI)** measures intrinsic community susceptibility. It is formulated following the IPCC climate vulnerability framework:

$$\text{HVI} = \left( w_1 \cdot \text{Sensitivity} \right) + \left( w_2 \cdot \text{Exposure} \right) - \left( w_3 \cdot \text{Adaptive Capacity} \right)$$

Where:
- **Sensitivity:** Fraction of vulnerable demographics:
  $$\text{Sensitivity} = 0.5 \cdot (\% \text{ Elderly } \ge 65) + 0.5 \cdot (\% \text{ Outdoor Workers / Laborers})$$
- **Exposure:** Satellite Land Surface Temperature (LST) normalized against city-wide baseline:
  $$\text{Exposure} = \frac{\text{LST}_{\text{ward}} - \text{LST}_{\min}}{\text{LST}_{\max} - \text{LST}_{\min}}$$
- **Adaptive Capacity:** Urban canopy & vegetation buffer:
  $$\text{Adaptive Capacity} = \text{Green Cover Percentage (NDVI-derived)}$$
- **Default Weights:**
  - $w_1 = 0.50$ (Demographic Sensitivity)
  - $w_2 = 0.35$ (Thermal Exposure)
  - $w_3 = 0.15$ (Green Space Buffer)
- **Score Range:** Normalized between `0` (Lowest vulnerability) and `100` (Highest vulnerability).

---

### 3.4 Risk Fusion Engine
The **Risk Fusion Engine** (`app/services/risk_fusion.py`) combines the static **HVI Score** with the dynamic **Weather Forecast** to determine the final daily risk tier:

| HVI Score | Forecast Max Temp / Heat Index | Final Risk Tier | Primary Advisory |
|---|---|:---:|---|
| Any | $< 40^\circ\text{C}$ (Normal) | **Low** 🟢 | Normal precautions. Drink water regularly. |
| $< 50$ | $40^\circ\text{C} - 43^\circ\text{C}$ | **Moderate** 🟡 | Stay shaded during peak noon hours (12 PM - 3 PM). |
| $\ge 50$ | $40^\circ\text{C} - 43^\circ\text{C}$ | **Severe** 🟠 | High risk for elderly and outdoor workers. Hydration points active. |
| $< 70$ | $43^\circ\text{C} - 45^\circ\text{C}$ | **Severe** 🟠 | Limit outdoor labor. Municipal cooling shelters open. |
| $\ge 70$ | $\ge 44^\circ\text{C}$ OR Heat Index $\ge 50^\circ\text{C}$ | **Extreme** 🔴 | **EMERGENCY:** Critical heat danger. Immediate cooling center evacuation. |

---

# 4. Role & Mechanics of the Backend (Express.js)

The Backend acts as the **central nervous system** of the project:

### 4.1 API Gateway & Data Provider
- Provides secure, CORS-enabled REST endpoints for the React frontend.
- Performs geospatial database queries (e.g., retrieving ward boundaries with embedded latest risk tiers).
- Manages CRUD operations for cooling center capacities and citizen illness reports.

### 4.2 The 30-Second Risk Watcher Daemon (`riskWatcher.cron.js`)
Instead of requiring manual human monitoring, an automated background cron daemon runs continuously:
1. Every 30 seconds, it queries MongoDB for any `DailyRisk` records where `riskTier IN ['Severe', 'Extreme']`.
2. Matches the ward ID to fetch ward metadata and population contacts.
3. Formats an emergency advisory tailored to that specific risk level.
4. Triggers multi-channel delivery.

### 4.3 Multi-Channel Alert Dispatch & Deduplication
To prevent flooding residents with repeated duplicate SMS messages, the watcher generates a **composite deduplication key**:

$$\text{dedupeKey} = \text{wardId} + \text{"-"} + \text{date} + \text{"-"} + \text{riskTier} + \text{"-"} + \text{recipientPhone}$$

- **Before sending:** Checks `alertlogs` collection for `dedupeKey`. If it exists, the alert is skipped.
- **After sending:** Records the sent alert with timestamp, delivery channel, recipient, and status.
- **Twilio Integration:** Uses Twilio REST API to send SMS. If unconfigured or in offline demo mode, gracefully logs simulated SMS payloads so testing never fails.

---

# 5. Exhaustive Folder-by-Folder & File-by-File Breakdown

```
SIH SIET/
├── ai-service/          # Python 3.11 FastAPI Machine Learning Microservice
├── backend/             # Node.js / Express.js REST API & Automation Gateway
├── frontend/            # React 18 / Vite / Tailwind v4 Client Application
├── scripts/             # Database Seeders, CLI Simulators, Test Automation
├── docs/                # API Contracts, Pitch Deck, Demo Scripts, Architecture
└── PROGRESS.md          # Real-time System Progress & Feature Matrix
```

---

### 5.1 AI Service (`/ai-service`)

| File / Folder | Purpose & Role in Architecture |
|---|---|
| [`app/main.py`](file:///d:/SIH%20SIET/ai-service/app/main.py) | **Primary FastAPI Entry Point**. Exposes `GET /health` and `POST /api/predict`. Handles Open-Meteo 72h live ingestion, GEE satellite fetching, pipeline execution, and dynamic unpickling hooks. |
| [`app/config.py`](file:///d:/SIH%20SIET/ai-service/app/config.py) | Configuration settings, default HVI weights ($w_1, w_2, w_3$), Open-Meteo URLs, MongoDB URI, and CORS origins. |
| [`app/services/weather_client.py`](file:///d:/SIH%20SIET/ai-service/app/services/weather_client.py) | Open-Meteo API client that fetches hourly meteorological metrics and computes the Heat Index formula. |
| [`app/services/gee_client.py`](file:///d:/SIH%20SIET/ai-service/app/services/gee_client.py) | Google Earth Engine client fetching MODIS `MOD11A1` 1km Land Surface Temperature (LST) with fallback. |
| [`app/services/hvi_model.py`](file:///d:/SIH%20SIET/ai-service/app/services/hvi_model.py) | Pure mathematical calculation of Heat Vulnerability Index (0–100) per ward. |
| [`app/services/risk_fusion.py`](file:///d:/SIH%20SIET/ai-service/app/services/risk_fusion.py) | Merges HVI score + 24h weather forecast into categorical risk tier (`Low`, `Moderate`, `Severe`, `Extreme`). |
| [`app/scheduler/daily_job.py`](file:///d:/SIH%20SIET/ai-service/app/scheduler/daily_job.py) | APScheduler cron daemon that executes daily batch risk recomputations across all wards. |
| [`train_local.py`](file:///d:/SIH%20SIET/ai-service/train_local.py) | Standalone training script that trains the XGBoost pipeline on `jaipur.csv` and outputs `urban_heatwave_pipeline.pkl`. |
| [`saved_models/urban_heatwave_pipeline.pkl`](file:///d:/SIH%20SIET/ai-service/saved_models) | Serialized Scikit-Learn + XGBoost pipeline model. |
| [`requirements.txt`](file:///d:/SIH%20SIET/ai-service/requirements.txt) | Complete pinned Python dependencies with `numpy < 2.0.0` and `dnspython`. |

---

### 5.2 Backend API (`/backend`)

| File / Folder | Purpose & Role in Architecture |
|---|---|
| [`src/server.js`](file:///d:/SIH%20SIET/backend/src/server.js) | **Express Application Entry Point**. Initializes Express, connects to MongoDB, mounts all REST routes, and starts the background risk watcher. |
| [`src/config/db.js`](file:///d:/SIH%20SIET/backend/src/config/db.js) | Mongoose MongoDB connection establishment with error handling. |
| [`src/jobs/riskWatcher.cron.js`](file:///d:/SIH%20SIET/backend/src/jobs/riskWatcher.cron.js) | Background 30-second cron job monitoring `DailyRisk` collection and triggering Twilio SMS/Firebase push. |
| [`src/services/twilioService.js`](file:///d:/SIH%20SIET/backend/src/services/twilioService.js) | Twilio SMS and Voice alert dispatcher with local mock simulation fallback. |
| [`src/services/firebaseService.js`](file:///d:/SIH%20SIET/backend/src/services/firebaseService.js) | Firebase Cloud Messaging push notification dispatcher. |
| [`src/models/Ward.js`](file:///d:/SIH%20SIET/backend/src/models/Ward.js) | Mongoose Schema for wards with GeoJSON Polygon boundary, demographics, and `2dsphere` index. |
| [`src/models/DailyRisk.js`](file:///d:/SIH%20SIET/backend/src/models/DailyRisk.js) | Mongoose Schema storing computed daily risk assessments per ward per date. |
| [`src/models/AlertLog.js`](file:///d:/SIH%20SIET/backend/src/models/AlertLog.js) | Mongoose Schema recording all dispatched alerts with unique `dedupeKey`. |
| [`src/models/Resource.js`](file:///d:/SIH%20SIET/backend/src/models/Resource.js) | Mongoose Schema for cooling centers, water ATMs, and medical relief camps. |
| [`src/models/Feedback.js`](file:///d:/SIH%20SIET/backend/src/models/Feedback.js) | Mongoose Schema for public citizen heat illness self-reports. |
| [`src/routes/wards.routes.js`](file:///d:/SIH%20SIET/backend/src/routes/wards.routes.js) | Express route handlers for fetching all wards and individual ward profiles. |
| [`src/routes/risk.routes.js`](file:///d:/SIH%20SIET/backend/src/routes/risk.routes.js) | Express route handlers for latest and historical risk queries. |
| [`src/routes/alerts.routes.js`](file:///d:/SIH%20SIET/backend/src/routes/alerts.routes.js) | Express route handlers for alert logs and manual broadcasts. |
| [`src/routes/resources.routes.js`](file:///d:/SIH%20SIET/backend/src/routes/resources.routes.js) | Express route handlers for cooling shelter status and occupancy updates. |
| [`src/routes/simulate.routes.js`](file:///d:/SIH%20SIET/backend/src/routes/simulate.routes.js) | Demo simulation endpoint (`POST /api/simulate`) that modifies a ward's active risk tier. |
| [`src/routes/feedback.routes.js`](file:///d:/SIH%20SIET/backend/src/routes/feedback.routes.js) | Citizen illness report submission and aggregate query endpoints. |

---

### 5.3 Frontend Client (`/frontend`)

| File / Folder | Purpose & Role in Architecture |
|---|---|
| [`src/App.jsx`](file:///d:/SIH%20SIET/frontend/src/App.jsx) | React Router application root defining routes for all 8 pages, navbar, and global state providers. |
| [`src/pages/AuthorityDashboard.jsx`](file:///d:/SIH%20SIET/frontend/src/pages/AuthorityDashboard.jsx) | Executive municipal command center with KPI stat cards, alerts table, and shelter gauges. |
| [`src/pages/RiskMapPage.jsx`](file:///d:/SIH%20SIET/frontend/src/pages/RiskMapPage.jsx) | Full-screen interactive Leaflet choropleth map rendering colored Jaipur ward boundaries. |
| [`src/pages/AlertsPage.jsx`](file:///d:/SIH%20SIET/frontend/src/pages/AlertsPage.jsx) | Alert dispatch center with audit logs, status filters, and emergency broadcast modal. |
| [`src/pages/AnalyticsPage.jsx`](file:///d:/SIH%20SIET/frontend/src/pages/AnalyticsPage.jsx) | Recharts temporal analytics comparing temperature trends, Heat Index, and HVI correlations. |
| [`src/pages/SheltersPage.jsx`](file:///d:/SIH%20SIET/frontend/src/pages/SheltersPage.jsx) | Directory and live capacity tracking of municipal cooling centers and hydration kiosks. |
| [`src/pages/CitizenPage.jsx`](file:///d:/SIH%20SIET/frontend/src/pages/CitizenPage.jsx) | Public citizen risk lookup tool and health precaution guidelines. |
| [`src/pages/CitizenReportsPage.jsx`](file:///d:/SIH%20SIET/frontend/src/pages/CitizenReportsPage.jsx) | Citizen heat illness reporting portal. |
| [`src/components/Map/HeatMap.jsx`](file:///d:/SIH%20SIET/frontend/src/components/Map) | Leaflet GeoJSON layer renderer with dynamic polygon styling and popup interactions. |
| [`src/components/SimulationToggle/SimulationToggle.jsx`](file:///d:/SIH%20SIET/frontend/src/components/SimulationToggle) | Live demo button sending `POST /api/simulate` to trigger full pipeline on stage. |
| [`src/services/api.js`](file:///d:/SIH%20SIET/frontend/src/services/api.js) | Centralized Axios service with automatic unwrapping and offline fallback mock datasets. |
| [`src/styles/index.css`](file:///d:/SIH%20SIET/frontend/src/styles/index.css) | Tailwind CSS v4 `@theme` design tokens, glassmorphism card utilities, and clean dark theme (`#0B0E14`). |

---

### 5.4 Helper Scripts (`/scripts`)

| File | Purpose |
|---|---|
| [`scripts/seed-db.js`](file:///d:/SIH%20SIET/scripts/seed-db.js) | Populates MongoDB with 6 Jaipur administrative wards, 9 cooling shelters, and initial daily risks. |
| [`scripts/simulate-heatwave.js`](file:///d:/SIH%20SIET/scripts/simulate-heatwave.js) | CLI fallback tool to trigger heatwave simulations directly from the terminal without opening the UI. |
| [`scripts/test-system.py`](file:///d:/SIH%20SIET/scripts/test-system.py) | Automated test suite that verifies all microservices, endpoints, and database interactions in one command. |

---

# 6. Database Schema & Data Contracts

### 6.1 `wards` Collection
```json
{
  "_id": "66bc8123...",
  "wardId": "JPR-W02",
  "name": "Mansarovar",
  "cityId": "jaipur-01",
  "population": 78000,
  "pctElderly": 0.12,
  "pctOutdoorWorkers": 0.35,
  "greenCoverPct": 0.08,
  "boundary": {
    "type": "Polygon",
    "coordinates": [[[75.74, 26.84], [75.78, 26.84], [75.78, 26.88], [75.74, 26.88], [75.74, 26.84]]]
  }
}
```

### 6.2 `dailyrisks` Collection
```json
{
  "_id": "66bc9456...",
  "wardId": "JPR-W02",
  "date": "2026-08-14",
  "hvi": 95,
  "forecastTempC": 46.0,
  "forecastHumidity": 20,
  "riskTier": "Extreme",
  "isSimulated": true,
  "computedAt": "2026-08-14T09:20:00.000Z"
}
```

### 6.3 `alertlogs` Collection
```json
{
  "_id": "66bca789...",
  "wardId": "JPR-W02",
  "tier": "Extreme",
  "channel": "sms",
  "recipientPhone": "+919876543210",
  "sentAt": "2026-08-14T09:20:30.000Z",
  "dedupeKey": "JPR-W02-2026-08-14-Extreme-+919876543210",
  "status": "sent"
}
```

---

# 7. The Live Simulation & Demo Sequence

This is the exact sequence to demonstrate to judges during the SIH presentation:

```
[ Step 1: Open Authority Dashboard ]
  Show the baseline state: Mansarovar (JPR-W02) is at "Moderate" risk (Yellow polygon on map).

[ Step 2: Explain Equity Problem ]
  "Mansarovar has 35% outdoor workers and only 8% green cover. If temperature rises, vulnerability spikes."

[ Step 3: Trigger Simulation ]
  Click the "Simulate Heatwave" toggle on the UI (or run `node scripts/simulate-heatwave.js --wardId JPR-W02 --tier Extreme`).
  • Frontend sends `POST /api/simulate` { wardId: "JPR-W02", tier: "Extreme" }.
  • Express writes updated DailyRisk document to MongoDB.

[ Step 4: Watcher Interception (< 30 Seconds) ]
  • Background cron job detects the new Extreme tier.
  • Deduplication engine validates no prior alert was sent.
  • Twilio SMS is dispatched to verified team phone numbers on stage.
  • Alert is logged to MongoDB `alertlogs`.

[ Step 5: Live UI Refresh ]
  • React client refetches `GET /api/wards`.
  • Leaflet polygon for Mansarovar turns bold RED 🔴.
  • Authority dashboard registers an active Extreme Emergency.
  • Presenter's phone receives the real SMS alert on stage 📱.
```

---

# 8. Summary of Team Roles & Next Actions

| Role | Member | Responsibilities | Immediate Next Action |
|---|---|---|---|
| **AI / Data Science Lead** | Member 2 | Weather ingestion, GEE MODIS LST, XGBoost pipeline, HVI mathematical model. | Verify model predictions with local weather changes. |
| **Backend & Integration Lead** | Member 1 | Express REST routes, MongoDB schemas, 30s cron watcher, Twilio SMS service. | Add real Twilio trial credentials to `.env` if desired for stage phone demo. |
| **Frontend & UX Lead** | Member 3 | React dashboard, Leaflet map choropleth, Recharts analytics, Dark UI styling. | Review UI layout on projector resolution (1080p). |
| **Citizen & Feature Lead** | Member 4 | Citizen lookup portal, illness reporting form, emergency shelters directory. | Verify mobile responsive view on citizen page. |
| **DevOps, QA & Pitch Lead** | Member 5 | Database seeding, end-to-end testing, demo script timing, judge Q&A prep. | Lead a 5-minute timed rehearsal using [`docs/DEMO_SCRIPT.md`](file:///d:/SIH%20SIET/docs/DEMO_SCRIPT.md). |

---

### 🏁 Quick Run Instructions for Entire Team

```powershell
# 1. Start MongoDB (or ensure local mongod / Atlas is active)
# 2. Seed Database
node scripts/seed-db.js

# 3. Terminal 1: AI Service (Port 8000)
cd ai-service
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# 4. Terminal 2: Backend API (Port 5000)
cd backend
npm run dev

# 5. Terminal 3: Frontend App (Port 5173)
cd frontend
npm run dev

# 6. Run Automated Test Suite anytime
& "ai-service\venv\Scripts\python.exe" "scripts\test-system.py"
```
