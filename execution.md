# Execution Guide — How This Project Works End-to-End

> **Read this before writing any code.** This document explains the data flow, how the three services connect, and the exact order your team should build things in.

---

## The Big Picture — One Sentence

**Satellite + weather data → AI computes a risk score per ward → Express watches for high risk → fires SMS/push alerts → React shows everything on a live map.**

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES (External)                      │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │ Google Earth  │  │  Open-Meteo  │  │ Census 2011 + Ward     │    │
│  │ Engine (LST)  │  │  (Forecast)  │  │ GeoJSON (Static Files) │    │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘    │
└─────────┼─────────────────┼──────────────────────┼─────────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AI SERVICE (FastAPI — Port 8000)                  │
│                                                                     │
│  1. gee_client.py  → fetches Land Surface Temperature per ward      │
│  2. weather_client.py → fetches forecast (temp, humidity) per city   │
│  3. hvi_model.py → computes Heat Vulnerability Index (0-100)        │
│  4. risk_fusion.py → combines HVI + forecast → Risk Tier            │
│  5. daily_job.py → runs steps 1-4 daily via APScheduler             │
│                                                                     │
│  Writes results to ──────────────────────────┐                      │
└──────────────────────────────────────────────┼──────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     MONGODB ATLAS (Shared Database)                  │
│                                                                     │
│  Collections:                                                       │
│  ┌──────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐         │
│  │  wards   │ │ dailyrisks │ │ alertlogs  │ │ resources │         │
│  └──────────┘ └────────────┘ └────────────┘ └───────────┘         │
│                                                                     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js — Port 5000)                    │
│                                                                     │
│  1. REST API → serves ward, risk, alert, resource data to frontend  │
│  2. riskWatcher.cron.js → polls dailyrisks every 30 seconds         │
│     → finds Severe/Extreme tiers                                    │
│     → checks alertlogs for duplicates (dedupeKey)                   │
│     → fires Twilio SMS and/or Firebase push                         │
│  3. simulate.routes.js → POST /api/simulate (demo button backend)   │
│                                                                     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────────┐
              │ Twilio   │  │ Firebase │  │ React App    │
              │ SMS/Voice│  │ Push     │  │ (Port 5173)  │
              └──────────┘  └──────────┘  └──────┬───────┘
                                                  │
┌─────────────────────────────────────────────────┼───────────────────┐
│                   FRONTEND (React + Vite)        │                   │
│                                                  │                   │
│  ┌────────────────────────────────────────────────┘                  │
│  │                                                                   │
│  │  Authority View:                                                  │
│  │  ├── HeatMap.jsx → colored ward polygons on Leaflet map          │
│  │  ├── Dashboard.jsx → Recharts (cooling centers, trends)          │
│  │  └── SimulationToggle.jsx → calls POST /api/simulate            │
│  │                                                                   │
│  │  Citizen View:                                                    │
│  │  ├── CitizenView.jsx → "check my area" ward lookup               │
│  │  └── FeedbackForm.jsx → heat illness report                      │
│  │                                                                   │
│  │  Shared:                                                          │
│  │  ├── AppContext.jsx → global state (wards, risks, selected ward) │
│  │  └── api.js → Axios calls to Express backend                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## The Three Services & How They Connect

### Service 1: AI Service (FastAPI — Python)
**Owner:** Member 2
**Port:** 8000
**Purpose:** The "brain" — ingests data, computes vulnerability, determines risk.

**How it connects:**
- Reads FROM external APIs (GEE, Open-Meteo)
- Reads FROM local files (`data/ward_boundaries.geojson`, `data/census_demographics.csv`)
- Writes TO MongoDB (`wards` collection on first run, `dailyrisks` collection on every run)
- Does NOT talk to Express directly — they communicate through MongoDB only

**When it runs:**
- Daily via APScheduler (configurable hour in `.env`)
- On-demand via `POST /internal/recompute` (used during demo)

---

### Service 2: Backend (Express.js — Node)
**Owner:** Member 1
**Port:** 5000
**Purpose:** The "mouth" — serves data to the frontend AND dispatches alerts when risk is high.

**How it connects:**
- Reads FROM MongoDB (all collections)
- Writes TO MongoDB (`alertlogs` when alerts are sent, `dailyrisks` via simulate endpoint)
- Calls Twilio API (outbound SMS/voice)
- Calls Firebase Admin SDK (push notifications)
- Serves REST API to the React frontend

**Two jobs running simultaneously:**
1. The Express REST API (handles frontend requests)
2. The node-cron watcher (background loop checking for Severe/Extreme risk tiers)

---

### Service 3: Frontend (React + Vite)
**Owner:** Members 3 & 4
**Port:** 5173 (Vite dev server)
**Purpose:** The "face" — the dashboard and citizen page everyone sees.

**How it connects:**
- Calls Express backend REST API only (never touches MongoDB or FastAPI directly)
- All API calls go through `src/services/api.js`
- State managed via React Context (`src/context/AppContext.jsx`)

---

## The Critical Loop — How the Demo Works

This is the exact sequence that happens when you press the **Simulation Toggle** during the demo:

```
Step 1: User clicks "Simulate Heatwave" in SimulationToggle.jsx
        ↓
Step 2: Frontend calls POST /api/simulate { wardId: "AHM-W03", tier: "Extreme" }
        ↓
Step 3: Express simulateController.js writes a DailyRisk doc to MongoDB:
        { wardId: "AHM-W03", riskTier: "Extreme", isSimulated: true, ... }
        ↓
Step 4: node-cron riskWatcher.cron.js (running every 30 seconds) detects:
        "There's a new Extreme risk for AHM-W03 and no matching alertlog"
        ↓
Step 5: Watcher calls twilioService.js → sends SMS to verified phone numbers
        Watcher calls firebaseService.js → sends push notification
        Watcher writes to alertlogs collection (dedupeKey prevents re-sending)
        ↓
Step 6: Frontend (polling or refetching) sees the updated risk tier
        HeatMap.jsx recolors the ward polygon from green/amber → red
        Dashboard.jsx shows the new alert in the alert log
        ↓
Step 7: Real SMS arrives on the team member's phone on stage 📱
```

**Time from click to SMS: ~30–60 seconds** (depends on cron interval + Twilio latency)

---

## Build Order — What Depends on What

This is why the day-by-day plan is sequenced the way it is:

```
Phase 1 (Day 1): FOUNDATIONS — nothing depends on anything yet
├── MongoDB Atlas cluster → everyone needs this
├── Ward GeoJSON + Census CSV → AI service needs this
├── Express scaffold → frontend needs this eventually
├── React scaffold → can use dummy data
└── FastAPI scaffold → can use mock data

Phase 2 (Day 2): VERTICAL SLICE — first real data flow
├── Member 2: HVI computation → writes to MongoDB ──┐
├── Member 1: Express routes → reads from MongoDB ───┤
│                                                     ▼
└── Member 3: React map → calls Express → shows real wards colored by HVI
    ⚡ THIS IS YOUR BACKBONE — everything else builds on top of this

Phase 3 (Day 3): ALERT PIPELINE — the "wow" moment
├── Member 2: Forecast + Risk Fusion → writes risk tiers to MongoDB ──┐
├── Member 1: Cron watcher + Twilio → reads tiers, sends SMS ─────────┤
│                                                                      ▼
└── Member 3: Simulation Toggle → triggers the whole pipeline live
    ⚡ GET THIS WORKING TODAY — this is what judges remember

Phase 4 (Day 4): FEATURE COMPLETION
├── Citizen page, feedback form, cooling centers
├── Dashboard charts with real/sample data
├── Deploy to Render/Railway/Vercel
└── First full dress rehearsal

Phase 5 (Day 5): BULLETPROOF
├── Cache "known good" demo dataset
├── Record backup video
├── Two timed rehearsals
└── Pre-stage checklist
```

---

## MongoDB — The Bridge Between Services

MongoDB is the **only** way the AI Service and Express Backend communicate. They never call each other's APIs directly. This is intentional:

```
AI Service (Python)                    Express Backend (Node)
       │                                      │
       │ writes wards,                        │ reads wards,
       │ writes dailyrisks                    │ reads dailyrisks,
       │                                      │ writes alertlogs,
       ▼                                      │ writes dailyrisks (simulate)
  ┌─────────┐                                 │
  │ MongoDB │ ◄────────────────────────────────┘
  └─────────┘
```

**Why this design?**
- No need for inter-service HTTP calls (simpler, fewer failure points)
- Either service can restart without breaking the other
- You can seed data manually and both services see it immediately

---

## Key Files Per Member — What to Focus On

### Member 1 (Backend Lead)
```
backend/src/
├── config/db.js           ← Start here (Mongoose connect)
├── models/*.js            ← Then define schemas
├── routes/*.js            ← Then build endpoints
├── controllers/*.js       ← Business logic for each route
├── services/twilio*.js    ← Day 3 (SMS dispatch)
├── services/firebase*.js  ← Day 3-4 (push notifications)
├── jobs/riskWatcher.cron.js ← Day 2-3 (the alert loop)
└── server.js              ← Ties everything together
```

### Member 2 (AI/Data Lead)
```
ai-service/
├── data/                  ← Start here (get ward GeoJSON + census CSV)
├── app/services/gee_client.py    ← Then fetch satellite data
├── app/services/weather_client.py ← Then fetch forecasts
├── app/services/hvi_model.py      ← Then build HVI formula
├── app/services/risk_fusion.py    ← Then combine HVI + forecast → tier
├── app/models/schemas.py          ← Pydantic validation
├── app/scheduler/daily_job.py     ← Wire it all into a daily job
└── app/routers/risk.py            ← Already done (manual trigger endpoint)
```

### Member 3 (Frontend Lead)
```
frontend/src/
├── services/api.js               ← Start here (Axios setup)
├── context/AppContext.jsx         ← Global state
├── components/Map/HeatMap.jsx     ← Core feature (Day 2)
├── components/SimulationToggle/   ← Critical demo feature (Day 3)
├── pages/AuthorityDashboard.jsx   ← Assembles map + dashboard + toggle
└── App.jsx                        ← Routing
```

### Member 4 (Frontend/UX)
```
frontend/src/
├── styles/index.css                     ← Start here (design system)
├── components/Dashboard/Dashboard.jsx    ← Charts (Day 2-3)
├── components/CitizenView/CitizenView.jsx ← Ward lookup (Day 3-4)
├── components/FeedbackForm/FeedbackForm.jsx ← Report form (Day 3-4)
└── pages/CitizenPage.jsx                 ← Assembles citizen components
```

### Member 5 (Integration/QA/Pitch)
```
scripts/
├── seed-db.js             ← Day 1-2 (loads data into Mongo)
└── simulate-heatwave.js   ← Day 3 (CLI fallback for demo)

docs/
├── ARCHITECTURE.md        ← Day 1 (facilitate team decisions)
├── DEMO_SCRIPT.md         ← Day 3-5 (refine the stage flow)
└── PITCH_DECK.md          ← Day 4-5 (finalize slides)

Also owns:
├── .env files across all services
├── End-to-end testing
├── Deployment (Day 4)
└── Pitch rehearsal (Day 5)
```

---

## Environment Setup Flowchart

```
Day 1 Morning — Every Member:
│
├── 1. Clone the repo
├── 2. Copy .env.example → .env in your service folder
├── 3. Get MONGO_URI from Member 1 (who sets up Atlas)
├── 4. Fill in your .env
│
├── If you're Member 1 (Backend):
│   └── cd backend → npm install → npm run dev
│
├── If you're Member 2 (AI/Data):
│   └── cd ai-service → python -m venv venv → .\venv\Scripts\Activate.ps1
│       → pip install -r requirements.txt → uvicorn app.main:app --reload --port 8000
│
├── If you're Member 3 or 4 (Frontend):
│   └── cd frontend → npm install → npm run dev
│
└── If you're Member 5 (Integration):
    └── Run all three services, confirm they start without errors
```

---

## Communication Protocol

### Daily Standup (15 minutes, same time each day)
Each person answers:
1. What did I finish yesterday?
2. What am I doing today?
3. Am I blocked on anything?

### Blockers That Need Immediate Escalation
- "I can't connect to MongoDB" → Member 1
- "Ward GeoJSON isn't ready" → Member 2
- "The API endpoint I need isn't built yet" → check `docs/API_CONTRACTS.md`, build a mock
- "Twilio isn't sending" → verify phone numbers, check trial limits
- "GEE is slow/timing out" → use mock data (gee_client.py has a fallback)

### Git Rules
```
main (always demo-ready — never push directly)
  ├── member1/day1-express-scaffold
  ├── member1/day2-routes-crud
  ├── member2/day1-data-sourcing
  ├── member2/day2-hvi-model
  ├── member3/day1-react-scaffold
  ├── member3/day2-map-integration
  ├── member4/day2-dashboard-charts
  └── member5/day3-integration-test
```
- Branch per person per day
- PR with at least one reviewer's glance
- Merge to main only when it works
- Commit every hour, even if incomplete

---

## Risk Tier Color System (Use Consistently Everywhere)

| Tier | HVI + Forecast Score | Hex Color | Usage |
|------|---------------------|-----------|-------|
| Low | 0–25 | `#22c55e` | Map polygon fill, badge, chart bar |
| Moderate | 26–50 | `#f59e0b` | Map polygon fill, badge, chart bar |
| Severe | 51–75 | `#f97316` | Map polygon fill, badge, chart bar — triggers SMS |
| Extreme | 76–100 | `#ef4444` | Map polygon fill, badge, chart bar — triggers SMS + push |

Use these exact hex values in:
- `frontend/src/styles/index.css` (CSS variables)
- `frontend/src/components/Map/HeatMap.jsx` (polygon fill)
- `frontend/src/components/Dashboard/Dashboard.jsx` (chart colors)
- `backend/src/jobs/riskWatcher.cron.js` (tier thresholds for alerting)
- `ai-service/app/services/risk_fusion.py` (tier assignment logic)
