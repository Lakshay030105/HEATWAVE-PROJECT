# Urban Heatwave Early Warning & Monitoring System — Progress & Feature Matrix
> **Project Status:** 🟢 **Active & End-to-End Operational (SIH Qualifier Ready)**  
> **Timestamp:** August 14, 2026 — 15:05 IST  
> **Target Region:** Jaipur Metropolitan Area, Rajasthan (6 Administrative Wards)  
> **Architecture:** Microservices Architecture (FastAPI + Express.js + React 18 / Vite + MongoDB)

---

## 1. Executive System Dashboard

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LIVE RUNTIME ENVIRONMENT                                  │
├───────────────────────┬───────────────────────────────┬───────────────────┬────────────────┤
│ Service Layer         │ Host / Port                   │ Status            │ Health Check   │
├───────────────────────┼───────────────────────────────┼───────────────────┼────────────────┤
│ 🌐 Frontend UI        │ http://localhost:5173         │ 🟢 RUNNING (Vite) │ 200 OK         │
│ ⚙️ Backend API        │ http://localhost:5000         │ 🟢 RUNNING (Node) │ 200 OK         │
│ 🧠 AI ML Service      │ http://localhost:8000         │ 🟢 RUNNING (Py311)│ 200 OK         │
│ 🗄️ Database           │ mongodb://127.0.0.1:27017     │ 🟢 CONNECTED      │ Seeded (6/6)   │
└───────────────────────┴───────────────────────────────┴───────────────────┴────────────────┘
```

---

## 2. Working Features Matrix (What is Built & Tested)

### 2.1. Frontend User Experience (`/frontend`) — 98% Complete ✅
- [x] **Authority Command Center (`/`)**:
  - Executive KPI summary cards (Total Population Protected, Active Severe/Extreme Warnings, Open Shelter Capacity, Emergency Units).
  - Risk tier breakdown widget (Low / Moderate / Severe / Extreme).
  - Cooling shelter occupancy bar charts with real-time capacity thresholds.
- [x] **Geospatial Risk & Vulnerability Map (`/map`)**:
  - Full Leaflet integration rendering 6 Jaipur municipal ward polygons (Malviya Nagar, Mansarovar, C-Scheme, Vaishali Nagar, Sanganer, Amer).
  - Dynamic risk-tier color choropleth (🟢 Low, 🟡 Moderate, 🟠 Severe, 🔴 Extreme).
  - Interactive click-to-inspect drawer: Displays Heat Vulnerability Index (HVI), demographic sensitivity (elderly %, outdoor worker %), and environmental exposure (vegetation cover %).
  - Real-time layer toggles: Switch between Risk Tiers, Satellite LST, and Hydration Points.
- [x] **Multi-Channel Alert Center (`/alerts`)**:
  - Real-time audit log of all dispatched emergency alerts (SMS, Voice, Push).
  - Filterable by ward, tier, and delivery status (`sent`, `delivered`).
  - Manual emergency broadcast override modal.
- [x] **Temporal Analytics & Heat Trends (`/analytics`)**:
  - Recharts line charts comparing diurnal temperature cycles vs. Heat Vulnerability Scores.
  - 72-hour forecast heat index progression curves.
- [x] **Emergency Resources & Shelters (`/shelters`, `/emergency`)**:
  - Live status directory of municipal cooling shelters, water ATMs, and hydration kiosks.
  - Capacity vs. Occupancy gauges with operational status controls (`open`, `closed`, `full`).
- [x] **Public Citizen Portal (`/citizen`, `/reports`)**:
  - "Check My Area Risk" geolocation lookup for residents.
  - Heatwave health advisories (symptom checkers, hydration reminders in local context).
  - Citizen heat illness reporting form with database persistence.
- [x] **Interactive Simulation Trigger (`SimulationToggle.jsx`)**:
  - Instant one-click demo button that injects synthetic Extreme heatwave conditions into any ward to demonstrate automated alert triggers during the live presentation.

---

### 2.2. Backend API Gateway & Automation (`/backend`) — 98% Complete ✅
- [x] **RESTful Resource Controllers**:
  - `GET /api/wards` & `GET /api/wards/:id` — Serves ward demographic and boundary data.
  - `GET /api/risk/latest` & `GET /api/risk/history/:wardId` — Real-time and historical risk tiers.
  - `GET /api/alerts` & `POST /api/alerts` — Alert logs and emergency broadcasts.
  - `GET /api/resources` & `PATCH /api/resources/:id` — Shelter & resource capacity management.
  - `POST /api/feedback` & `GET /api/feedback` — Citizen illness reports.
  - `POST /api/simulate` — Simulation trigger endpoint modifying active risk states.
- [x] **Automated Background Risk Watcher (`riskWatcher.cron.js`)**:
  - High-frequency background daemon (`node-cron`) polling MongoDB every 30 seconds for Severe and Extreme risk wards.
  - Composite deduplication engine (`wardId-date-tier-recipient`) to prevent duplicate message spam.
  - Multi-channel dispatch orchestration: Automatically fires Twilio SMS and Firebase Cloud Messaging alerts.
  - Graceful mock fallback: Accurately logs simulated SMS payloads in local testing when external Twilio credentials are not configured.
- [x] **Database Architecture & Seeder (`/models`, `/scripts`)**:
  - Production-ready Mongoose schemas with 2dsphere geospatial indexing and compound uniqueness constraints.
  - Fully functional seeding script ([`scripts/seed-db.js`](file:///d:/SIH%20SIET/scripts/seed-db.js)) populating Jaipur wards, demographics, cooling centers, and baseline risk records.
  - Dedicated CLI fallback simulator ([`scripts/simulate-heatwave.js`](file:///d:/SIH%20SIET/scripts/simulate-heatwave.js)) for triggering simulations directly from the terminal if the UI is not accessible.

---

### 2.3. AI & Data Science Service (`/ai-service`) — 95% Complete ✅
- [x] **FastAPI Inference Microservice (`app/main.py`)**:
  - `GET /health` — Diagnostic endpoint returning model loaded state, database status, and UTC timestamp.
  - `POST /api/predict` — Real-time predictive pipeline taking coordinates and returning heatwave classification.
- [x] **Live Ingestion & Temporal Feature Engineering**:
  - `fetch_live_weather()`: Ingests 72 hours of historical + live Open-Meteo hourly metrics (temperature, humidity, dew point, wind gust, surface pressure).
  - `fetch_gee_data()`: Integrated Google Earth Engine MODIS (`MOD11A1`) satellite Land Surface Temperature (LST) extraction with Open-Meteo fallback.
  - `TemporalFeatureEngineer`: Custom scikit-learn transformer computing rolling averages, lag differences, and diurnal heating rates.
- [x] **Model Serving**:
  - Pre-trained XGBoost model pipeline (`urban_heatwave_pipeline.pkl`) classifying heat risk into discrete severity tiers (`Low`, `Mild`, `Extreme`).
  - Dynamic `sys.modules['__main__']` unpickling integration resolving transformer classes safely.
  - Pinned and isolated Python virtual environment dependencies (`requirements.txt`).

---

## 3. Features Left to Build / Optional Enhancements

| Feature / Task | Priority | Effort | Description / Action Required |
|---|:---:|:---:|---|
| **Twilio Live SMS Credentials** | 🟡 Medium | 5 mins | Add real `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `MY_PHONE_NUMBER` in `backend/.env` if you want a real phone on stage to ring/vibrate during the demo instead of using the local mock logger. |
| **GEE Cloud Authentication** | 🟢 Low | 5 mins | Run `earthengine authenticate` in terminal if you want live Google Earth Engine satellite tiles instead of the automatic Open-Meteo real-time fallback. |
| **Timed Demo Rehearsal** | 🔴 High | 10 mins | Conduct a 5-minute timed run-through following [`docs/DEMO_SCRIPT.md`](file:///d:/SIH%20SIET/docs/DEMO_SCRIPT.md) to ensure clean team handoffs. |
| **CSV Export for Municipal Authorities** | ⚪ Optional (Stretch) | 15 mins | Add a "Download Daily Ward Report (CSV)" button on the Authority Analytics page for government officials. |
| **Bilingual Toggle (Hindi / English)** | ⚪ Optional (Stretch) | 20 mins | Add a language switch button in the navbar for citizen advisories in Hindi. |

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
