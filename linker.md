# Jaipur Heatwave EWS — Integration & Linking Guide (`linker.md`)

This guide explains how to connect all 4 layers of the **Urban Heatwave Early Warning System** (Python AI Service, Node.js/Express Backend, MongoDB Database, and React Frontend) so that live heat risk predictions and simulation triggers flow seamlessly to the UI.

---

## 1. System Integration Architecture

```
┌────────────────────────┐      ┌─────────────────────────┐
│   Python AI Service    │      │  Weather & Census Data  │
│  (FastAPI - Port 8000) │      │  (Open-Meteo / CSVs)   │
└───────────┬────────────┘      └────────────┬────────────┘
            │                                │
            │ Computes HVI Risk              │
            ▼                                ▼
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                     │
│               (mongodb://localhost:27017)               │
│   Collections: wards, dailyrisks, alertlogs, resources  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ Reads & Writes Data
                            ▼
┌─────────────────────────────────────────────────────────┐
│                Node.js Express Backend                  │
│                     (Port 5000)                         │
│  Endpoints: /api/wards, /api/simulate, /api/alerts, etc.│
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ REST API (JSON Envelope)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  React + Vite Frontend                  │
│                     (Port 5173)                         │
│  Service: api.js (Axios) -> AppContext -> Dashboard UI  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Linking Instructions

### Step 1: Environment Variables Configuration

Ensure each component has its correct environment file:

#### A. Frontend (`frontend/.env`)
Create or edit `d:\SIH SIET\frontend\.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

#### B. Backend (`backend/.env`)
Create or edit `d:\SIH SIET\backend\.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urban-heatwave
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

#### C. AI Service (`ai-service\.env`)
Create or edit `d:\SIH SIET\ai-service\.env`:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/urban-heatwave
OPEN_METEO_URL=https://api.open-meteo.com/v1/forecast
```

---

### Step 2: Database Initialization & Seeding

Populate MongoDB with the Jaipur ward boundaries and baseline resources:

1. Start your local MongoDB server:
   ```bash
   mongod
   ```
2. Run the seeding script from the root directory:
   ```bash
   node scripts/seed-db.js
   ```
   *This populates the `wards`, `dailyrisks`, and `resources` collections with Jaipur coordinates.*

---

### Step 3: Linking Python AI Service to Backend & Database

The Python AI service calculates Heat Vulnerability Indexes (HVI) and risk predictions.

1. **How AI Writes Risk Data:**
   The AI service executes its risk fusion pipeline (`ai-service/app/services/risk_fusion.py`) and writes `DailyRisk` documents directly to the `dailyrisks` collection in MongoDB:
   ```python
   # Sample DailyRisk Document written by AI
   {
       "wardId": "JAI-W01",
       "date": "2026-08-13",
       "hvi": 88,
       "forecastTempC": 46.5,
       "forecastHumidity": 22,
       "riskTier": "Extreme",
       "computedAt": datetime.utcnow(),
       "isSimulated": False
   }
   ```

2. **Triggering Manual Recompute from Backend:**
   If Express needs to force the AI model to recompute:
   ```js
   // Express controller calling AI FastAPI endpoint
   await axios.post('http://localhost:8000/internal/recompute');
   ```

---

### Step 4: Connecting Frontend to Backend API (`api.js`)

The frontend's service layer in `frontend/src/services/api.js` is configured with automatic fallback:

```javascript
// frontend/src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// When Express backend is running, Axios fetches live data from MongoDB.
// If backend is offline, Axios catch block seamlessly falls back to local Jaipur mock data.
export const getWards = () => api.get('/wards').catch(() => ({ success: true, data: MOCK_WARDS }));
export const simulateHeatwave = (wardId, tier) => api.post('/simulate', { wardId, tier });
```

---

### Step 5: How Live Simulation & AI Updates Reflect in the UI

1. **Live Updates:** `AppContext.jsx` polls `refreshAll()` every 15 seconds. When the backend or AI updates MongoDB, the new temperatures and risk tiers automatically refetch and render on the Leaflet map and Dashboard.
2. **Simulation Control Flow:**
   ```
   [User Clicks "Simulate" in UI] 
               │
               ▼
   POST /api/simulate { wardId: "JAI-W02", tier: "Extreme" }
               │
               ▼
   [Express Backend writes simulated DailyRisk doc to MongoDB]
               │
               ▼
   [Frontend refetches /api/wards -> UI map recolors to Red]
               │
               ▼
   [riskWatcher.cron.js detects Extreme tier -> Dispatches SMS]
   ```

---

## 3. Starting the Full Stack

Run all 3 services in separate terminals:

### Terminal 1: AI Service (Python FastAPI)
```bash
cd ai-service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2: Backend (Node.js Express)
```bash
cd backend
npm run dev
```

### Terminal 3: Frontend (React Vite)
```bash
cd frontend
npm run dev
```

---

## 4. Troubleshooting & Verification

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **CORS Error in Browser** | Express backend blocking frontend origin | Ensure `cors()` middleware is active in `backend/src/server.js` |
| **Frontend shows mock data only** | Express backend not running on port 5000 | Check `backend` terminal for startup errors and confirm `MONGODB_URI` connection |
| **Simulation button has no effect** | Backend `/api/simulate` endpoint unhandled | Ensure `app.use('/api/simulate', simulateRoutes)` is registered in `server.js` |
| **Map markers don't change color** | Risk tier string mismatch | Verify risk tiers are exact casing: `"Low"`, `"Moderate"`, `"Severe"`, `"Extreme"` |

*Document created: August 2026 for Jaipur Urban Heatwave EWS.*
