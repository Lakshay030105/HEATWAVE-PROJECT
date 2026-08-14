# Urban Heatwave Early Warning & Monitoring System — Progress & System Matrix
> **Project Status:** 🟢 **Active & 100% End-to-End Operational**  
> **Timestamp:** August 14, 2026 — 16:05 IST  
> **Target Region:** Jaipur Metropolitan Area, Rajasthan (6 Administrative Wards: JPR-W01 to JPR-W06)  
> **Architecture:** Full-Stack Microservices Architecture (FastAPI ML Service + Node.js/Express.js Backend + React 18 / Vite Frontend + MongoDB Atlas / Local)

---

## 1. Executive Live Services Dashboard

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LIVE RUNTIME ENVIRONMENT                                  │
├───────────────────────┬───────────────────────────────┬───────────────────┬────────────────┤
│ Service Layer         │ Host / Port                   │ Status            │ Health / Ping  │
├───────────────────────┼───────────────────────────────┼───────────────────┼────────────────┤
│ 🌐 Frontend UI        │ http://localhost:5174         │ 🟢 RUNNING (Vite) │ 200 OK         │
│ ⚙️ Backend API        │ http://localhost:5000         │ 🟢 RUNNING (Node) │ 200 OK         │
│ 🧠 AI ML Service      │ http://localhost:8000         │ 🟢 ONLINE (Py311) │ 200 OK (Loaded)│
│ 🗄️ MongoDB Database   │ mongodb://127.0.0.1:27017     │ 🟢 CONNECTED      │ 6 Wards Seeded │
└───────────────────────┴───────────────────────────────┴───────────────────┴────────────────┘
```

---

## 2. End-to-End Data Flow & Linkage Verification

```
  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                                    DATA FLOW PIPELINE                                   │
  └─────────────────────────────────────────────────────────────────────────────────────────┘

  [1. SATELLITE & WEATHER INGESTION]
  Open-Meteo 72h Weather API + Google Earth Engine MODIS LST
                  │
                  ▼
  [2. PYTHON AI SERVICE (Port 8000)]
  XGBoost Pipeline (`urban_heatwave_pipeline.pkl`) + TemporalFeatureEngineer
  • POST `/api/predict` -> Live prediction per lat/lng (e.g. "Low", "Mild", "Extreme")
  • GET `/health` -> Model state & sensor availability
                  │
                  ▼
  [3. EXPRESS BACKEND & MONGODB (Port 5000 / 27017)]
  • `GET /api/wards` -> Ward boundaries + joined latest DailyRisk + demographics
  • `GET /api/risk/latest` & `GET /api/risk/history/:wardId` -> Map colors & trendline charts
  • `GET /api/resources` & `PUT /api/resources/:id` -> Shelters, cooling centers, occupancy
  • `GET /api/alerts` & `POST /api/alerts` -> Emergency broadcast logs & manual dispatches
  • `GET /api/feedback` & `POST /api/feedback` & `PUT /api/feedback/:id` -> Citizen reports
  • `GET /api/emergency/units` & `POST /api/emergency/dispatch` -> 108 Ambulance / Tanker fleet
  • `POST /api/simulate` -> One-click heatwave trigger for live demos
  • `riskWatcher.cron.js` -> 30s automated watchdog polling DB & sending Twilio/Firebase SMS
                  │
                  ▼
  [4. REACT FRONTEND DASHBOARD (Port 5174)]
  • Authority Command Center (`/`): Shows Live ML Risk Engine card (`AIPrediction.jsx`), Leaflet Heatmap, KPI cards, Shelter occupancy, and sparkline trends.
  • Geospatial Risk Map (`/map`): Leaflet choropleth with AI time-travel prediction slider.
  • Emergency Broadcast Center (`/alerts`): Auditable broadcast logs & new dispatch modal.
  • Heat Vulnerability Analytics (`/analytics`): HVI explainability formula, weights, CSV export, Recompute ML button.
  • Shelter & Hydration Network (`/shelters`): Live capacity sliders & tanker dispatch.
  • Emergency Response Hub (`/emergency`): 108 ambulance queue & live rapid dispatch.
  • Citizen Moderation Feed (`/reports`): Moderation desk for crowdsourced reports.
  • Public Citizen Portal (`/citizen`): Public ward risk lookup & citizen hazard reporting.
```

---

## 3. Working Features Matrix (What is Built & Tested)

### 3.1. Frontend User Experience (`/frontend`) — 100% Complete ✅
- [x] **Authority Command Center (`/`)**:
  - Executive KPI cards (Population protected, warning counters, shelter capacity, fleet units).
  - Risk tier breakdown badge & interactive selected ward inspector.
  - Live AI Risk Prediction engine card displaying real-time XGBoost output and ambient sensor temp.
  - Interactive Leaflet HeatMap with color choropleth and risk markers.
- [x] **Geospatial Risk Map (`/map`)**:
  - 6 Jaipur municipal ward polygons (Malviya Nagar, Mansarovar, C-Scheme, Vaishali Nagar, Sanganer, Amer).
  - Real-time layer switcher (HVI, Satellite LST, NDVI Green Cover, Demographics).
  - Time-travel forecasting slider (0h, 3h, 6h, 12h, 24h, 48h) dynamically simulating future risk curves.
- [x] **Emergency Broadcast Center (`/alerts`)**:
  - Auditable broadcast log table with masked phone numbers and delivery telemetry.
  - "Dispatch New Broadcast" modal sending live alerts to `POST /api/alerts`.
- [x] **Heat Vulnerability Analytics (`/analytics`)**:
  - Explainable HVI formula breakdown: `HVI = 0.35×LST + 0.25×Elderly + 0.25×Outdoor + 0.15×(1-Green)`.
  - 7-day temperature trajectory area charts and multi-ward comparison bar charts.
  - "Export CSV Report" button for municipal disaster reports.
  - "Recompute ML Pipeline" trigger button synchronizing models with latest datasets.
- [x] **Cooling Shelters & Hydration Network (`/shelters`)**:
  - Real-time shelter occupancy tracking with interactive update modal (`PUT /api/resources/:id`).
  - PHED water tanker dispatch integration.
- [x] **Emergency Fleet & Triage Hub (`/emergency`)**:
  - 108 Ambulance, PHED Tanker, and Mobile Clinic deployment board (`/api/emergency/units`).
  - Live heat-stroke triage queue with one-click dispatch (`/api/emergency/dispatch`).
- [x] **Citizen Ground Reports Moderation (`/reports`)**:
  - Live crowdsourced hazard moderation desk connected to `GET /api/feedback`.
  - Status progression workflow (Pending &rarr; Investigating &rarr; Resolved with resolution note).
- [x] **Public Citizen Portal (`/citizen`)**:
  - Citizen risk lookup by ward with nearest cooling shelter locator.
  - Crowdsourced heat illness / water shortage report submission form (`POST /api/feedback`).

---

### 3.2. Backend API Gateway & Automation (`/backend`) — 100% Complete ✅
- [x] **RESTful Resource Routes**:
  - `GET /api/wards` & `GET /api/wards/:id` — Serves ward demographic and boundary data with joined latest risk.
  - `GET /api/risk/latest` & `GET /api/risk/history/:wardId` — Real-time and historical risk tiers.
  - `GET /api/alerts` & `POST /api/alerts` — Dispatched alerts audit log and broadcast creation.
  - `GET /api/resources` & `PUT /api/resources/:id` — Shelter & resource capacity management.
  - `GET /api/feedback`, `POST /api/feedback`, `PUT /api/feedback/:id` — Citizen illness reports feed, submission, and triage.
  - `GET /api/emergency/units` & `POST /api/emergency/dispatch` — Emergency vehicle fleet coordination.
  - `POST /api/simulate` — Simulation trigger endpoint modifying active risk states.
- [x] **Automated Background Risk Watcher (`riskWatcher.cron.js`)**:
  - High-frequency background daemon (`node-cron`) polling MongoDB every 30 seconds for Severe and Extreme risk wards.
  - Composite deduplication engine (`wardId-date-tier-recipient`) to prevent duplicate message spam.
  - Multi-channel dispatch orchestration (Twilio SMS and Firebase Cloud Messaging alerts).
  - Graceful mock fallback logging SMS payloads in local testing when credentials are not supplied.
- [x] **Database Schemas & Seeder (`/models`, `/scripts`)**:
  - Mongoose models (`Ward`, `DailyRisk`, `AlertLog`, `Resource`, `Feedback`) with 2dsphere geospatial indexing and compound uniqueness constraints.
  - Seed script ([`scripts/seed-db.js`](file:///d:/SIH%20SIET/scripts/seed-db.js)) populating Jaipur wards, demographics, cooling centers, and baseline risk records.

---

### 3.3. AI & Machine Learning Service (`/ai-service`) — 100% Complete ✅
- [x] **FastAPI Inference Microservice (`app/main.py`)**:
  - `GET /health` — Diagnostic endpoint returning model loaded state, GEE availability, database status, and timestamp.
  - `POST /api/predict` — Real-time predictive pipeline taking coordinates (`latitude`, `longitude`) and returning heatwave classification.
- [x] **Live Ingestion & Temporal Feature Engineering**:
  - `fetch_live_weather()`: Ingests 72 hours of historical + live Open-Meteo hourly metrics.
  - `fetch_gee_data()`: Integrated Google Earth Engine MODIS (`MOD11A1`) satellite Land Surface Temperature (LST) extraction with Open-Meteo fallback.
  - `TemporalFeatureEngineer`: Custom scikit-learn transformer computing rolling averages, lag differences, and diurnal heating rates.
- [x] **Model Serving**:
  - Pre-trained XGBoost model pipeline (`urban_heatwave_pipeline.pkl`) classifying heat risk into discrete severity tiers (`Low (No Heatwave)`, `Mild Heatwave`, `Extreme Heatwave`).
  - Dynamic `sys.modules['__main__']` unpickling integration resolving transformer classes safely.

---

## 4. End-to-End Demo Workflow (Verified Working 🎯)

```
 [1. Press Simulate Button]       [2. Backend Ingestion]        [3. MongoDB State Change]
 User clicks "Simulate" in ───► POST /api/simulate       ───► DailyRisk updated to
 SimulationToggle.jsx          { wardId: "JPR-W02",           { riskTier: "Extreme",
                                 tier: "Extreme" }              isSimulated: true }
                                                                      │
                                                                      ▼
 [6. Live UI Updates]           [5. SMS / Push Dispatch]      [4. 30s Cron Watcher]
 HeatMap turns RED 🔴   ◄───  Twilio SMS dispatched    ◄─── riskWatcher.cron.js
 AlertLog updates table       Logged in AlertLog doc        Detects Extreme tier
 AI Card shows Extreme
```

---

## 5. Summary of Quick Commands

```powershell
# Run the automated end-to-end local test suite:
& "d:\SIH SIET\ai-service\venv\Scripts\python.exe" "d:\SIH SIET\scripts\test-system.py"

# Re-seed the MongoDB database:
node scripts/seed-db.js

# Trigger a CLI simulation fallback:
node scripts/simulate-heatwave.js --wardId JPR-W02 --tier Extreme
```
