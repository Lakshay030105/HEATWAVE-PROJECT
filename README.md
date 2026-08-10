# Urban Heatwave Early Warning & Monitoring System 🌡️

> Ward-level heat vulnerability indexing, targeted multi-channel alerts, and real-time monitoring for Indian cities.

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    DATA INGESTION                          │
│  Google Earth Engine (LST) + Open-Meteo + Census/Ward Data │
└──────────────────────┬─────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────┐
│                   AI PROCESSING (FastAPI)                   │
│  HVI Model → Risk Fusion (HVI + Forecast) → Risk Tier      │
└──────────────────────┬─────────────────────────────────────┘
                       │  writes to MongoDB
┌──────────────────────▼─────────────────────────────────────┐
│              WARNING DISPATCH (Express.js)                  │
│  node-cron Watcher → Twilio SMS/Voice + Firebase Push       │
└──────────────────────┬─────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────┐
│               MONITORING & UI (React + Leaflet)            │
│  Authority Dashboard + Citizen View + Simulation Toggle     │
└────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
urban-heatwave-ews/
├── ai-service/          # Python FastAPI — HVI, risk fusion, GEE/weather
├── backend/             # Express.js — REST API, alert dispatch, cron watcher
├── frontend/            # React + Vite — dashboard, map, citizen page
├── docs/                # Architecture decisions, API contracts, demo script
├── scripts/             # DB seeding, CLI simulation fallback
└── README.md
```

---

## 🚀 Quick Start (Windows)

### Prerequisites

- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)
- **MongoDB Atlas** free-tier cluster (or local MongoDB)
- **Google Earth Engine** registered Cloud project

### 1. Clone & Install

```powershell
git clone <your-repo-url>
cd urban-heatwave-ews
```

### 2. AI Service (FastAPI)

```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # then fill in your values
uvicorn app.main:app --reload --port 8000
```

### 3. Backend (Express.js)

```powershell
cd backend
npm install
copy .env.example .env   # then fill in your values
npm run dev
```

### 4. Frontend (React + Vite)

```powershell
cd frontend
npm install
copy .env.example .env   # then fill in your values
npm run dev
```

### 5. Seed the Database

```powershell
cd scripts
node seed-db.js
```

---

## 🔑 Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `MONGO_URI` | AI + Backend | MongoDB Atlas connection string |
| `GEE_PROJECT_ID` | AI | Google Earth Engine Cloud project ID |
| `GEE_SERVICE_ACCOUNT_KEY` | AI | Path to GEE service account JSON key |
| `OPEN_METEO_BASE_URL` | AI | Open-Meteo API base URL (default: `https://api.open-meteo.com`) |
| `TWILIO_ACCOUNT_SID` | Backend | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Backend | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Backend | Twilio verified sender number |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Backend | Path to Firebase Admin SDK JSON key |
| `VITE_API_BASE_URL` | Frontend | Express backend URL (default: `http://localhost:5000/api`) |

---

## 👥 Team

| Role | Responsibility |
|------|---------------|
| **Member 1** — Backend Lead | Express API, MongoDB, Twilio/Firebase dispatch |
| **Member 2** — AI/Data Lead | FastAPI, GEE, HVI model, risk fusion |
| **Member 3** — Frontend Lead | React app, react-leaflet map, Simulation Toggle |
| **Member 4** — Frontend/UX | Recharts dashboards, citizen page, visual polish |
| **Member 5** — Integration/QA/Pitch | Wiring, testing, deployment, demo script |

---

## 📄 Documentation

- [Architecture Decisions](docs/ARCHITECTURE.md)
- [API Contracts](docs/API_CONTRACTS.md)
- [Demo Script](docs/DEMO_SCRIPT.md)
- [Execution Playbook](Urban_Heatwave_Execution_Playbook.md)

---

## 📝 License

This project is built for Smart India Hackathon 2026 — SIET internal qualifier.
