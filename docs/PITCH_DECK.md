# Pitch Deck — Outline

> Convert this into slides (Google Slides / PowerPoint / Canva).
> Keep to 8–10 slides maximum.

---

## Slide 1 — Title

**Urban Heatwave Early Warning & Monitoring System**

_Ward-level vulnerability indexing · Targeted alerts · Real-time monitoring_

Team Name: _____________
Smart India Hackathon 2026 — SIET Internal Qualifier

---

## Slide 2 — The Problem

- Heatwaves: India's deadliest natural disaster (more deaths than floods + cyclones + earthquakes combined)
- Current warnings are **generic** and **city-wide**
- A slum resident with no fan and an office worker with AC get the **same** warning
- No tracking of cooling centers or response effectiveness

_Visual: Split image — vulnerable community vs. air-conditioned office_

---

## Slide 3 — Our Solution

**A system that asks, per ward:**
1. **Who lives here?** (demographics, vulnerability)
2. **How hot will it get here?** (satellite + forecast data)
3. **What should we do about it?** (targeted, automated alerts)

_Visual: Simple 3-step flow diagram_

---

## Slide 4 — How It Works (Architecture)

```
Satellite Data + Weather → AI Processing → Targeted Alerts → Live Dashboard
```

- Data layer: Google Earth Engine + Open-Meteo + Census
- AI layer: Heat Vulnerability Index + Risk Fusion
- Alert layer: Twilio SMS + Firebase Push (only to at-risk wards)
- UI layer: React dashboard + Citizen view

_Visual: Architecture diagram from README_

---

## Slide 5 — The Innovation

**Ward-level vulnerability-weighted targeting**

- Not just "it's hot" — but "it's hot AND this ward has 40% elderly residents with no green cover"
- Same forecast → different risk tiers → different responses
- Explainable model (not a black box)

_Visual: Side-by-side ward comparison (different colors, same forecast)_

---

## Slide 6 — Live Demo

_(This is where you switch to the live app)_

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the exact 2-minute flow.

---

## Slide 7 — Data & Feasibility

| Data Source | Cost | Access |
|-------------|------|--------|
| Google Earth Engine (Landsat/MODIS LST) | Free | Public |
| Open-Meteo (weather forecast) | Free | No API key |
| Census 2011 (demographics) | Free | data.gov.in |
| Ward boundaries (GeoJSON) | Free | City GIS portals |

**Everything is real, free, and publicly accessible.**

---

## Slide 8 — Social Impact

- **Equity-focused**: Protects the most vulnerable (elderly, outdoor workers, low-cooling-access residents)
- **Actionable**: Not just warnings — suggests specific responses (open cooling center in Ward X)
- **Feedback loop**: Citizen reports feed back into vulnerability scoring
- **Scalable**: Free data + cloud free tiers → any city in India

---

## Slide 9 — Tech Stack

| Layer | Technology |
|-------|-----------|
| Satellite | Google Earth Engine |
| Forecast | Open-Meteo |
| AI/ML | FastAPI + scikit-learn + Pandas |
| Backend | Express.js + MongoDB Atlas |
| Alerts | Twilio SMS + Firebase Push |
| Frontend | React + react-leaflet + Recharts |

---

## Slide 10 — Future Roadmap

1. Voice/IVR alerts in local languages
2. Prophet/LSTM time-series forecasting (v2)
3. Municipal partnership for real-time cooling center data
4. PWA with push notification opt-in for citizens
5. National scaling with automated city onboarding

---

## Closing Slide

**"Predictive. Targeted. Equitable."**

_Urban Heatwave Early Warning & Monitoring System_

Team: _____________ | GitHub: _____________ | Contact: _____________
