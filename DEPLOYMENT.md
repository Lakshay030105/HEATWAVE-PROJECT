# 🚀 Deployment Guide — Urban Heatwave EWS

> **Goal:** Get all 3 services + database live on the internet for the SIH 2026 hackathon demo.
>
> **Total estimated time:** 45–60 minutes (first time) · 10 minutes (subsequent redeploys)

---

## Table of Contents

1. [Architecture & Service Map](#1-architecture--service-map)
2. [Prerequisites Checklist](#2-prerequisites-checklist)
3. [Step 0 — MongoDB Atlas (Database)](#step-0--mongodb-atlas-database)
4. [Step 1 — Deploy AI Service (FastAPI → Render)](#step-1--deploy-ai-service-fastapi--render)
5. [Step 2 — Deploy Backend (Express.js → Render)](#step-2--deploy-backend-expressjs--render)
6. [Step 3 — Deploy Frontend (React + Vite → Vercel)](#step-3--deploy-frontend-react--vite--vercel)
7. [Step 4 — Wire Everything Together](#step-4--wire-everything-together)
8. [Step 5 — Seed the Production Database](#step-5--seed-the-production-database)
9. [Step 6 — Verify End-to-End](#step-6--verify-end-to-end)
10. [Alternative: Railway Deployment](#alternative-railway-deployment)
11. [Troubleshooting](#troubleshooting)
12. [Quick Redeploy Cheat Sheet](#quick-redeploy-cheat-sheet)

---

## 1. Architecture & Service Map

```
┌───────────────────────────────────────────────────────────────────┐
│                      DEPLOYED ARCHITECTURE                        │
│                                                                   │
│  ┌─────────────────┐     ┌─────────────────┐     ┌────────────┐  │
│  │   React + Vite  │────▶│  Express.js API  │────▶│  FastAPI   │  │
│  │   (Vercel)      │     │   (Render)       │     │  (Render)  │  │
│  │  Port: 443/HTTPS│     │  Port: 443/HTTPS │     │ Port: 8000 │  │
│  └─────────────────┘     └────────┬─────────┘     └──────┬─────┘  │
│                                   │                      │        │
│                            ┌──────▼──────────────────────▼──┐     │
│                            │    MongoDB Atlas (M0 Free)      │     │
│                            │    + Twilio SMS · Firebase Push │     │
│                            └─────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────┘
```

| Service | Stack | Deploy To | Free Tier? | Custom Domain? |
|---------|-------|-----------|------------|----------------|
| **Database** | MongoDB 7.x | Atlas M0 | ✅ 512 MB | N/A |
| **AI Service** | Python 3.10 + FastAPI | Render (Web Service) | ✅ | `ai-service-xxx.onrender.com` |
| **Backend** | Node.js 18 + Express | Render (Web Service) | ✅ | `backend-xxx.onrender.com` |
| **Frontend** | React 18 + Vite | Vercel | ✅ | `project.vercel.app` |

---

## 2. Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **GitHub account** — push your code to a GitHub repo (public or private)
- [ ] **Render account** — sign up free at [render.com](https://render.com) (use GitHub SSO)
- [ ] **Vercel account** — sign up free at [vercel.com](https://vercel.com) (use GitHub SSO)
- [ ] **MongoDB Atlas account** — sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
- [ ] **Twilio account** — free trial at [twilio.com](https://www.twilio.com/try-twilio)
- [ ] **Firebase project** — created at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] **Google Earth Engine** — Cloud project with service account key JSON
- [ ] **Code pushed to GitHub** — all 3 services committed and pushed

### Push Code to GitHub

```powershell
# From the project root (d:\SIH SIET)
git init
git add .
git commit -m "initial commit - hackathon ready"
git remote add origin https://github.com/<your-username>/urban-heatwave-ews.git
git push -u origin main
```

---

## Step 0 — MongoDB Atlas (Database)

> Your single source of truth for wards, risk scores, and alerts.

### 0.1 Create a Free Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Create a Cluster**
2. Select **M0 (Free Tier)** → Region: **Mumbai (ap-south-1)** (closest to India)
3. Cluster name: `heatwave-cluster`
4. Click **Create Deployment**

### 0.2 Create a Database User

1. Go to **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `heatwave-admin`
4. Password: Use **Autogenerate Secure Password** → **Copy and save it!**
5. Role: **Atlas Admin** (for hackathon simplicity)
6. Click **Add User**

### 0.3 Whitelist All IPs (for Render/Railway)

1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** → confirms `0.0.0.0/0`
3. Click **Confirm**

> ⚠️ **Security note:** `0.0.0.0/0` is fine for a hackathon. For production, whitelist specific IPs.

### 0.4 Get Your Connection String

1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Drivers** → Select **Node.js** or **Python**
3. Copy the connection string:
   ```
   mongodb+srv://heatwave-admin:<password>@heatwave-cluster.xxxxx.mongodb.net/urban_heatwave?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. **Save this string** — you'll need it for both AI Service and Backend

---

## Step 1 — Deploy AI Service (FastAPI → Render)

### 1.1 Create Required Files

You need two files in the `ai-service/` directory:

#### `ai-service/Dockerfile`

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

# Start uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### `ai-service/render.yaml` (optional — Render Blueprint)

```yaml
services:
  - type: web
    name: heatwave-ai-service
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: MONGO_URI
        sync: false
      - key: MONGO_DB_NAME
        value: urban_heatwave
      - key: GEE_PROJECT_ID
        sync: false
      - key: GEE_SERVICE_ACCOUNT_KEY
        sync: false
      - key: OPEN_METEO_BASE_URL
        value: https://api.open-meteo.com/v1
      - key: CORS_ORIGINS
        sync: false
```

### 1.2 Deploy on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your **GitHub repo**
3. Configure:

   | Setting | Value |
   |---------|-------|
   | **Name** | `heatwave-ai-service` |
   | **Root Directory** | `ai-service` |
   | **Runtime** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | Free |

4. Add **Environment Variables** (click "Add Environment Variable"):

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | `mongodb+srv://heatwave-admin:<pw>@...` |
   | `MONGO_DB_NAME` | `urban_heatwave` |
   | `GEE_PROJECT_ID` | Your GEE project ID |
   | `GEE_SERVICE_ACCOUNT_KEY` | Paste the **entire JSON content** of your service account key file |
   | `OPEN_METEO_BASE_URL` | `https://api.open-meteo.com/v1` |
   | `CORS_ORIGINS` | `https://your-frontend.vercel.app,https://your-backend.onrender.com` |
   | `PYTHON_VERSION` | `3.10.12` |

5. Click **Create Web Service**
6. Wait for the build to complete (~3–5 mins)
7. Note your URL: `https://heatwave-ai-service.onrender.com`

### 1.3 Verify AI Service

```powershell
# Test the health endpoint
curl https://heatwave-ai-service.onrender.com/docs
```

You should see the FastAPI Swagger UI.

---

## Step 2 — Deploy Backend (Express.js → Render)

### 2.1 Create Required Files

#### `backend/Dockerfile` (optional — Render auto-detects Node.js)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

### 2.2 Deploy on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connect the **same GitHub repo**
3. Configure:

   | Setting | Value |
   |---------|-------|
   | **Name** | `heatwave-backend` |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `node src/server.js` |
   | **Instance Type** | Free |

4. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | `mongodb+srv://heatwave-admin:<pw>@...` (same as Step 0) |
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |
   | `AI_SERVICE_URL` | `https://heatwave-ai-service.onrender.com` |
   | `TWILIO_ACCOUNT_SID` | Your Twilio SID |
   | `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
   | `TWILIO_PHONE_NUMBER` | Your Twilio phone number (e.g., `+1234567890`) |
   | `FIREBASE_SERVICE_ACCOUNT_KEY` | Paste **entire JSON content** of Firebase Admin SDK key |

5. Click **Create Web Service**
6. Wait for build (~2–3 mins)
7. Note your URL: `https://heatwave-backend.onrender.com`

### 2.3 Verify Backend

```powershell
# Test the API
curl https://heatwave-backend.onrender.com/api/wards
```

---

## Step 3 — Deploy Frontend (React + Vite → Vercel)

> Vercel is the best free option for Vite/React apps — instant deploys, global CDN, automatic HTTPS.

### 3.1 Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repo
3. Configure:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

4. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://heatwave-backend.onrender.com/api` |

5. Click **Deploy**
6. Wait for build (~1–2 mins)
7. Note your URL: `https://urban-heatwave-ews.vercel.app`

### 3.2 Verify Frontend

Open `https://urban-heatwave-ews.vercel.app` in your browser. You should see the dashboard.

---

## Step 4 — Wire Everything Together

Now update the CORS and cross-service URLs so all 3 services talk to each other.

### 4.1 Update AI Service (Render)

Go to your AI Service on Render → **Environment** → Update:

```
CORS_ORIGINS=https://urban-heatwave-ews.vercel.app,https://heatwave-backend.onrender.com
```

### 4.2 Update Backend (Render)

Go to your Backend on Render → **Environment** → Update:

```
AI_SERVICE_URL=https://heatwave-ai-service.onrender.com
```

Ensure `cors` in `server.js` allows your Vercel frontend origin. If your `server.js` uses `cors()` with no options, it allows all origins (fine for hackathon). If it has an allowlist, add:

```
https://urban-heatwave-ews.vercel.app
```

### 4.3 Update Frontend (Vercel)

Already set in Step 3 — but double-check:

```
VITE_API_BASE_URL=https://heatwave-backend.onrender.com/api
```

> After changing env vars, **redeploy** each service (Render does this automatically; Vercel requires a manual redeploy from the dashboard).

---

## Step 5 — Seed the Production Database

### Option A: Run Locally Pointing to Atlas

```powershell
cd scripts

# Temporarily set the production MONGO_URI
$env:MONGO_URI = "mongodb+srv://heatwave-admin:<password>@heatwave-cluster.xxxxx.mongodb.net/urban_heatwave?retryWrites=true&w=majority"

node seed-db.js
```

### Option B: Use MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect using your Atlas connection string
3. Import data manually via the GUI

### Option C: Use mongosh

```powershell
# Install mongosh if needed
winget install MongoDB.Shell

# Connect and verify
mongosh "mongodb+srv://heatwave-admin:<password>@heatwave-cluster.xxxxx.mongodb.net/urban_heatwave"

# Check collections
show collections
db.wards.countDocuments()
```

---

## Step 6 — Verify End-to-End

Run through this checklist after deployment:

| # | Test | Expected Result | ✅ |
|---|------|----------------|-----|
| 1 | Open frontend URL in browser | Dashboard loads, map renders | |
| 2 | Check ward markers on map | Ward pins visible with color coding | |
| 3 | Click a ward marker | Risk details panel opens | |
| 4 | Hit `/api/wards` on backend URL | JSON array of wards | |
| 5 | Hit `/docs` on AI service URL | Swagger UI loads | |
| 6 | Trigger simulation toggle | Risk tiers update in real-time | |
| 7 | Check SMS delivery | Twilio sends test alert (if configured) | |
| 8 | Check browser console | No CORS errors, no 500s | |

---

## Alternative: Railway Deployment

> [Railway](https://railway.app) is another free option with a simpler UX. It auto-detects Dockerfile, Node, and Python projects.

### Deploy All 3 Services on Railway

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy AI Service
cd ai-service
railway init --name heatwave-ai
railway up
railway variables set MONGO_URI="mongodb+srv://..." GEE_PROJECT_ID="..." OPEN_METEO_BASE_URL="https://api.open-meteo.com/v1"
railway domain   # get the public URL

# Deploy Backend
cd ../backend
railway init --name heatwave-backend
railway up
railway variables set MONGO_URI="mongodb+srv://..." AI_SERVICE_URL="https://heatwave-ai.up.railway.app" PORT="5000" NODE_ENV="production"
railway domain

# Deploy Frontend
cd ../frontend
railway init --name heatwave-frontend
railway up
railway variables set VITE_API_BASE_URL="https://heatwave-backend.up.railway.app/api"
railway domain
```

---

## Troubleshooting

### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| **CORS errors in console** | Backend doesn't allow frontend origin | Add Vercel URL to CORS allowlist in `server.js` or env var |
| **502 Bad Gateway (Render)** | App crashed on startup | Check Render logs: Dashboard → Service → Logs |
| **Render free tier sleeps** | Free instances spin down after 15 min of inactivity | Send a "wake-up" request ~2 min before demo; use [UptimeRobot](https://uptimerobot.com) for auto-ping |
| **MongoDB connection timeout** | IP not whitelisted | Atlas → Network Access → `0.0.0.0/0` |
| **`MODULE_NOT_FOUND`** | Missing dependency | Run `npm install` locally, commit `package-lock.json`, push |
| **Vite env vars not loading** | Env var doesn't start with `VITE_` | All frontend env vars must start with `VITE_` |
| **GEE auth fails** | Service account key not loaded | For Render: paste full JSON in env var, then parse it in code with `json.loads(os.environ["GEE_SERVICE_ACCOUNT_KEY"])` |
| **Twilio not sending SMS** | Trial account restrictions | Verify recipient numbers in Twilio console; free tier only sends to verified numbers |

### Render Free Tier Cold Start Workaround

Render's free tier spins down after 15 minutes of inactivity and takes ~30–60 seconds to spin back up. For a smooth hackathon demo:

```powershell
# Option 1: Manual wake-up — hit both services 2 minutes before demo
curl https://heatwave-ai-service.onrender.com/docs
curl https://heatwave-backend.onrender.com/api/wards

# Option 2: Use UptimeRobot (free) to ping every 14 minutes
# → https://uptimerobot.com — add HTTP monitors for both Render URLs
```

### Reading Render Logs

```
Render Dashboard → Select Service → Logs tab → Watch for:
  ✅ "🚀 Backend running on port 5000"
  ✅ "Uvicorn running on http://0.0.0.0:8000"
  ❌ "Error: Cannot find module '...'"
  ❌ "MongooseServerSelectionError"
```

---

## Quick Redeploy Cheat Sheet

After making code changes during the hackathon:

```powershell
# 1. Commit and push
git add .
git commit -m "fix: update risk threshold"
git push origin main

# 2. Render auto-deploys on push (if auto-deploy is enabled)
#    Otherwise: Render Dashboard → Service → Manual Deploy → Deploy latest commit

# 3. Vercel auto-deploys on push (always enabled by default)

# 4. Verify
curl https://heatwave-backend.onrender.com/api/wards
```

---

## Final Production URLs (Fill In After Deployment)

| Service | Live URL |
|---------|----------|
| **Frontend** | `https://________.vercel.app` |
| **Backend API** | `https://________.onrender.com` |
| **AI Service** | `https://________.onrender.com` |
| **MongoDB Atlas** | `mongodb+srv://...` |
| **Swagger Docs** | `https://________.onrender.com/docs` |

---

## 📋 Pre-Demo Checklist (30 Minutes Before)

- [ ] Wake up Render services (hit both URLs)
- [ ] Verify frontend loads and map renders
- [ ] Verify at least one ward has risk data
- [ ] Test the simulation toggle
- [ ] Test SMS alert (if applicable)
- [ ] Open Swagger docs as backup demo
- [ ] Have local dev server ready as **Plan B**
- [ ] Clear browser cache and open in incognito
- [ ] Phone fully charged (for SMS demo)
- [ ] Demo script printed/memorized ([DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md))

---

> 🎯 **Tip:** If deployment becomes a blocker, run all 3 services locally on your laptop and demo from `localhost`. The code works the same — only the URLs change. Don't let deployment eat into your demo prep time.

---

*Last updated: August 2026 · SIH 2026 — SIET Team*
