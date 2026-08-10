# Urban Heatwave Early Warning & Monitoring System
## Complete Build & Winning Playbook — Internal SIH Qualifier (5 Days, 5 Members)

---

## Quick-Reference Summary

| Section | What It Covers | Who Needs It |
|---------|---------------|--------------|
| §0 | Assumptions & adaptations | Everyone (read once) |
| §1 | One-paragraph pitch | Everyone (memorize) |
| §2 | Problem in plain language | Everyone |
| §3 | Judging rubric | Everyone |
| §4 | Architecture overview | Everyone |
| §5 | Tech stack & rationale | Everyone |
| §6 | **Scoping decisions (Day 1)** | **All team — lock these first** |
| §7 | Team roles | Everyone |
| §8 | Folder structure | Members 1–5 |
| §9 | API contracts | Members 1, 2, 3 |
| §10 | **Day-by-day execution** | **Everyone (daily reference)** |
| §11 | Common mistakes | Everyone |
| §12 | QA checklist | Member 5 (lead), all |
| §13 | Deployment plan | Member 5 |
| §14 | Demo script | Everyone (rehearse) |
| §15 | Judge Q&A prep | Everyone |
| §16 | Pre-stage checklist | Everyone |
| §17 | Stretch goals | Only if ahead |
| §18 | Environment variable reference | Members 1, 2, 3 |

---

## 0. Read This First — Assumptions Made in This Plan

Your source PDFs describe a **6-member team** and a **36–40 hour onsite hackathon** window. You told me you have **5 members** and **5 days**. I've adapted the plan accordingly:

- **Roles**: I merged "Backend Support" into a new **Integration/DevOps/Presentation** role (Member 5), because in a 5-day prep window, someone owning integration, testing, and the pitch is more valuable than a second pure backend coder.
- **Timeline**: I've treated each of the 5 days as ~8 hours of focused team time (not a continuous 40-hour sprint). If your internal round is actually a single overnight sprint, compress Days 1–2 into "Hour 0–16" and Days 3–5 into "Hour 16–36" — the task order stays the same.
- If your real team composition differs, just re-slot the task lists below — they're written by *function*, not by name.

Everything else follows your project brief exactly. Nothing in the architecture or tech stack has been changed — only the execution plan is adapted to your real constraints.

---

## 1. Executive Summary (Your One-Paragraph Pitch)

Heatwaves quietly kill more people in India every year than floods, cyclones, and earthquakes combined — yet warnings today are generic and city-wide, ignoring that a slum resident and a gated-community resident in the same city face wildly different risk. This project builds a **ward-level Heat Vulnerability Index**, fuses it with live weather forecasts to produce a daily risk tier per ward, and automatically fires **targeted, multi-channel alerts** (SMS, voice, push) only to the wards and channels that need them — while giving city authorities a live dashboard to track cooling-center capacity and response effectiveness. It's disaster management that's predictive, targeted, and demo-able with real free data.

---

## 2. The Problem, In Plain Language

Right now, heatwave warnings work like a fire alarm that rings the same volume in every room of a building, whether that room has a sleeping baby or an empty storage closet. Everyone gets "it's going to be hot," but:

- The elderly person with no fan in a slum and the office worker with AC get the identical message.
- Nobody's tracking whether cooling centers are actually open or full.
- Nobody's checking whether yesterday's warning actually helped anyone.

Your system fixes this by asking, per ward: **who lives here, how hot will it actually get here, and what should we do about it right now** — then automating the answer into an SMS, a voice call, or a push notification, and putting the whole picture on a live map for the people in charge.

---

## 3. The Judging Lens — What Gets You Into the Top 5

Most internal SIH rounds score against a version of this rubric. Use it to decide where to spend your limited hours.

| Criterion | What judges are really checking | How this project delivers |
|---|---|---|
| **Problem understanding** | Did you pick a real, underserved problem, not a toy one? | Heat kills more than flood/cyclone/quake combined, and it's an *under-picked* SIH category — you'll stand out just by topic choice. |
| **Technical depth** | Is there real engineering here, or just a UI wrapped around nothing? | Satellite data (GEE), a real vulnerability model, forecast fusion, automated multi-channel dispatch — genuine full-stack + data science. |
| **Working prototype** | Does it actually run, live, in front of them? | This plan is built around getting a working end-to-end vertical slice by Day 2, not Day 5. |
| **Innovation / differentiation** | Have you seen this exact idea 10 times already? | Ward-level *vulnerability-weighted* targeting (not just weather-based) is the differentiator — say this explicitly in your pitch. |
| **Feasibility & data reality** | Is this buildable with real, accessible data, or is it hand-waving? | Every data source listed is free and public. Say so out loud. |
| **Social impact** | Does it help the most vulnerable, not just the average citizen? | Explicit equity framing: elderly, outdoor workers, low-cooling-access residents. Keep this in your pitch, not just your docs. |
| **Presentation & clarity** | Can the team explain it simply and handle questions? | Section 14–15 below give you the script and the Q&A prep. |

**The single biggest risk to your score is *not* the tech — it's running out of time and demoing a broken pipeline.** Everything in this plan is sequenced to protect against that.

---

## 4. System Architecture, Explained Simply

Four layers, each one feeding the next:

```
1. DATA INGESTION       →  satellite heat data, weather forecast, ward demographics
2. AI PROCESSING        →  turns raw data into a Risk Tier per ward (Low/Moderate/Severe/Extreme)
3. WARNING DISPATCH     →  watches for Severe/Extreme, sends the right alert on the right channel
4. MONITORING & UI      →  live map + dashboard for authorities, a simple page for citizens
```

Think of it as: **sensors → brain → mouth → face.** The satellite and weather APIs are the sensors. The Python/scikit-learn model is the brain deciding how worried to be. The Express watcher + Twilio/Firebase is the mouth that shouts when needed. The React dashboard is the face everyone actually looks at.

**Why hybrid Python + Node (MERN) instead of one language end-to-end?** Because Python has the best free tooling for satellite data and ML (Earth Engine SDK, scikit-learn), while Node/Express + React is faster to build a reactive dashboard and REST API with. MongoDB sits in the middle as the shared "bridge" so the two halves never need to talk to each other directly — they only ever talk to the database. This is a deliberate architecture decision worth stating in your pitch: **it shows you understand tradeoffs, not just tools.**

---

## 5. Technology Stack & Why Each Piece Exists

| Layer | Tool | Why this one (in plain terms) |
|---|---|---|
| Satellite data | Google Earth Engine | Free access to Landsat/MODIS land surface temperature — the "how hot is this actual patch of ground" data. |
| Weather forecast | Open-Meteo | Free, no API key, reliable — removes a signup bottleneck under time pressure. |
| ML / vulnerability scoring | scikit-learn + Pandas | Simple, explainable weighted-index modeling — you can explain exactly why a ward scored high, which matters when judges ask "how does this work?" |
| AI microservice | FastAPI | Fast to stand up, async-friendly, plays well with Python's data/ML ecosystem. |
| Scheduling | APScheduler | Runs the daily recompute job without needing a separate infra piece like Celery+Redis (which eats setup time you don't have). |
| Database | MongoDB Atlas | Native GeoJSON support (needed for ward boundaries), free tier, no server to manage. |
| Backend API | Express.js | Thin, fast REST layer between Mongo and React; huge ecosystem, easy for a team to split routes across people. |
| Watcher | node-cron | Polls Mongo for severe risk without needing a message queue. |
| Alerts | Twilio (SMS/voice) + Firebase (push) | Industry-standard, well-documented, free trial tiers exist for demo purposes. |
| Frontend | React + react-leaflet | react-leaflet is the fastest path to a GeoJSON-colored map; React's component model splits cleanly across 2 frontend devs. |
| Charts | Recharts | Clean, React-native charting with minimal config. |

---

## 6. Critical Scoping Decisions — Lock These on Day 1, Before Anyone Writes Code

Teams lose days to scope drift more than to bugs. Decide these as a group in the first hour and write the answers into your repo's `docs/ARCHITECTURE.md`:

1. **Target city.** Pick a city where ward-boundary GeoJSON and Census 2011 ward-level demographics are actually obtainable (city GIS portal, data.gov.in, or OpenCity). Ahmedabad is a strong narrative choice — it already runs India's best-known real-world Heat Action Plan, so your pitch becomes *"we built the digital nervous system for something that already saves lives."* If Ahmedabad's data is hard to source in time, any tier-1/tier-2 city with published ward shapefiles works just as well — the story matters more than the specific city.
2. **Data scope for the demo.** Getting full-city, all-ward data in 5 days is genuinely hard. **Pick 8–12 wards, not the whole city**, covering a visible range of vulnerability (a dense low-income ward, a green affluent ward, one in between). A focused, accurate 10-ward demo beats a shaky 150-ward one every time.
3. **Which alert channel is "must-have" vs "nice-to-have."** Recommend: **SMS via Twilio is must-have** (fast to wire, reliable to demo). Voice/IVR and Firebase push are real stretch goals — build them only if Day 4 finishes early.
4. **Forecasting model complexity.** Recommend a **transparent weighted-scoring model**, not an LSTM, as your primary approach. A model you can explain in one sentence survives a judge's follow-up question much better than a neural net your team can't fully defend under pressure. If someone finishes early, layering Prophet on top as a "v2 forecast enhancement" is a good stretch goal — but ship the simple, explainable version first.
5. **Google Earth Engine access.** GEE now requires a registered Cloud project and can take anywhere from minutes to about a day for approval. **Apply today, before Day 1 starts**, so you're not blocked.

---

## 7. Team Structure — 5 Members

**Member 1 — Backend Lead**
Owns MongoDB schema design, the Express REST API, and the Twilio/Firebase alert-dispatch logic. The person who has to explain "how does an alert actually get sent" in Q&A.

**Member 2 — AI/Data Lead**
Owns the FastAPI microservice: pulling GEE satellite data, merging demographics, building the HVI (Heat Vulnerability Index) model, pulling Open-Meteo forecasts, and the risk-fusion logic that writes the final tier to Mongo.

**Member 3 — Frontend Lead**
Owns the React app architecture, the react-leaflet map, state management, and the Simulation Toggle — the single most important button in your entire demo.

**Member 4 — Frontend/UX Developer**
Owns Recharts dashboards (cooling-center capacity, trend charts), the citizen-facing "check my area" page, the heat-illness feedback form, and overall visual polish/consistency.

**Member 5 — Integration, QA & Presentation Lead**
Owns the node-cron watcher (paired with Member 1), wiring the three services together, environment/config management, end-to-end testing, deployment, the demo script, and pitch rehearsal. This role exists because **nobody else has time to also own "does the whole thing actually work together"** — and that's usually what breaks in front of judges.

---

## 8. Folder Structure

```
d:\SIH SIET\
├── README.md
├── .gitignore
├── Urban_Heatwave_Execution_Playbook.md      ← you are here
│
├── docs/
│   ├── ARCHITECTURE.md          # Day-1 scoping decisions (fill this out first!)
│   ├── API_CONTRACTS.md         # MongoDB schemas + REST endpoints
│   ├── DEMO_SCRIPT.md           # 2-minute stage flow with timing
│   └── PITCH_DECK.md            # slide outline — convert to Google Slides / PPT
│
├── ai-service/                  # Python FastAPI microservice (Member 2)
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # env vars + settings
│   │   ├── routers/
│   │   │   └── risk.py          # POST /internal/recompute endpoint
│   │   ├── services/
│   │   │   ├── gee_client.py    # satellite LST fetch (has mock fallback)
│   │   │   ├── weather_client.py# Open-Meteo integration
│   │   │   ├── hvi_model.py     # vulnerability index calculation
│   │   │   └── risk_fusion.py   # HVI + forecast → tier
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   └── scheduler/
│   │       └── daily_job.py     # APScheduler daily recompute
│   ├── data/
│   │   ├── ward_boundaries.geojson  # ← add your city's ward GeoJSON here
│   │   └── census_demographics.csv  # ← add Census 2011 ward data here
│   ├── notebooks/               # exploratory HVI tuning
│   ├── requirements.txt         # pinned Python deps
│   └── .env.example
│
├── backend/                     # Express.js API (Member 1)
│   ├── src/
│   │   ├── server.js            # Express entry point
│   │   ├── config/
│   │   │   └── db.js            # MongoDB/Mongoose connection
│   │   ├── models/
│   │   │   ├── Ward.js
│   │   │   ├── DailyRisk.js
│   │   │   ├── AlertLog.js
│   │   │   └── Resource.js
│   │   ├── routes/
│   │   │   ├── wards.routes.js
│   │   │   ├── risk.routes.js
│   │   │   ├── alerts.routes.js
│   │   │   ├── resources.routes.js
│   │   │   └── simulate.routes.js   # the Simulation Toggle endpoint
│   │   ├── controllers/
│   │   │   ├── wardController.js
│   │   │   ├── riskController.js
│   │   │   ├── alertController.js
│   │   │   ├── resourceController.js
│   │   │   └── simulateController.js
│   │   ├── services/
│   │   │   ├── twilioService.js
│   │   │   └── firebaseService.js
│   │   ├── jobs/
│   │   │   └── riskWatcher.cron.js  # node-cron alert dispatcher
│   │   └── middleware/
│   │       └── errorHandler.js
│   ├── package.json             # Node deps pre-listed
│   └── .env.example
│
├── frontend/                    # React + Vite app (Members 3 & 4)
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   └── HeatMap.jsx          # react-leaflet ward map
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx        # Recharts authority dashboard
│   │   │   ├── SimulationToggle/
│   │   │   │   └── SimulationToggle.jsx # THE demo button
│   │   │   ├── CitizenView/
│   │   │   │   └── CitizenView.jsx      # "check my area" widget
│   │   │   └── FeedbackForm/
│   │   │       └── FeedbackForm.jsx     # citizen heat-illness report
│   │   ├── context/
│   │   │   └── AppContext.jsx           # global state
│   │   ├── services/
│   │   │   └── api.js                   # Axios API layer
│   │   ├── pages/
│   │   │   ├── AuthorityDashboard.jsx
│   │   │   └── CitizenPage.jsx
│   │   └── styles/
│   │       └── index.css
│   ├── public/
│   ├── package.json             # React deps pre-listed
│   └── .env.example
│
└── scripts/
    ├── seed-db.js               # loads ward GeoJSON + demographics into Mongo
    └── simulate-heatwave.js     # CLI fallback if UI toggle fails on stage
```

---

## 9. Quick-Start Commands (Windows — PowerShell)

**Step 1 — Clone and enter the project:**
```powershell
cd "d:\SIH SIET"
git init
git branch -M main
```

**Step 2 — AI Service (Member 2):**
```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env           # fill in your values
uvicorn app.main:app --reload --port 8000
```

**Step 3 — Backend (Member 1):**
```powershell
cd backend
npm install
copy .env.example .env           # fill in your values
npm run dev
```

**Step 4 — Frontend (Members 3 & 4):**
```powershell
cd frontend
npm install
copy .env.example .env           # fill in your values
npm run dev
```

**Step 5 — Seed the database (Member 5):**
```powershell
cd scripts
node seed-db.js
```

> **Note:** On Unix/macOS, replace `.\venv\Scripts\Activate.ps1` with `source venv/bin/activate` and `copy` with `cp`.

**Git workflow (keep this simple — you don't have time for a heavy process):**
- `main` is always demo-ready. Nobody pushes straight to `main`.
- One branch per person per day (e.g., `member1/day2-express-routes`), merged via a quick PR that at least one other person glances at.
- Commit early and often — a broken half-day of work you can revert is much better than losing it.

---

## 10. API Contracts — Write This Down on Day 1 Before Anyone Codes

Integration bugs eat more hackathon time than anything else. Agree on these shapes as a team **before** Members 1, 2, and 3 start building in parallel.

> **Full contract details are in `docs/API_CONTRACTS.md`.** Below is the summary.

**MongoDB Collections:** `wards`, `dailyrisks`, `alertlogs`, `resources`, `feedback`

**Express REST endpoints (frontend calls these):**
- `GET /api/wards` — all wards with current risk tier joined in
- `GET /api/wards/:wardId` — single ward details
- `GET /api/wards/:wardId/risk` — risk history for one ward
- `GET /api/risk/latest` — latest risk for all wards
- `GET /api/alerts` — recent alert log
- `GET /api/resources?type=cooling_center` — cooling center status
- `POST /api/feedback` — citizen heat-illness report
- `POST /api/simulate` — **the demo button.** Body: `{ "wardId": "AHM-W03", "tier": "Extreme" }`

**FastAPI internal endpoints (mostly scheduler-driven, but expose one manual trigger for demo safety):**
- `GET /health` — health check (hit this before demo to wake up cold-start services)
- `POST /internal/recompute` — force a fresh HVI + risk-fusion run
- `GET /internal/status` — last computation timestamp + stats

---

## 11. Day-by-Day Execution Plan

### Day 1 — Foundations & Data Collection
**Goal:** every service scaffolded and runnable; scope decisions locked; ward data obtained for the chosen city.

- **All team (first hour):** Lock the Section 6 decisions. Fill out `docs/ARCHITECTURE.md`. Set up your communication channel and a daily 15-minute standup time. Assign GitHub access.
- **Member 1:** Create the MongoDB Atlas free-tier (M0) cluster, create the collections with the Section 10 schema, scaffold Express (`server.js`, folder structure, DB connection), push the first commit.
- **Member 2:** Confirm GEE access works end-to-end with a test query. Scaffold FastAPI. **Start ward-boundary + demographic data sourcing immediately — this is the highest-risk task of the whole project**, because if it slips, everyone downstream is blocked.
- **Member 3:** Scaffold the React app (Vite), install react-leaflet, render a basic map centered on the target city with a placeholder polygon (don't wait on Member 2's real data to start).
- **Member 4:** Set up Recharts, define your risk-tier color system (Low/Moderate/Severe/Extreme), wireframe the citizen "check my area" page and feedback form using dummy data.
- **Member 5:** Set up the GitHub repo with branch protection on `main`, `.env` files for all three services from `.env.example`, a simple task board (GitHub Projects/Trello), and draft the demo narrative outline.

**End-of-day Definition of Done:** three runnable services exist in the repo (even mostly empty); Mongo cluster is live; ward GeoJSON for the target city is obtained, even if incomplete.

---

### Day 2 — Core Engines: Vulnerability Index, Backend CRUD, Live Map
**Goal:** the first true vertical slice — real ward data flowing all the way to the map.

- **Member 1:** Build the Express routes (`GET /wards`, `GET /wards/:id/risk`, `GET /alerts`, Resources CRUD). Write a seed script that loads Member 2's ward GeoJSON into Mongo.
- **Member 2:** Build the HVI formula (weighted combination of LST z-score, % elderly, % outdoor workers, inverse green cover, normalized 0–100). Run it and push HVI scores into Mongo.
- **Member 3:** Connect the map to the real `GET /wards` endpoint; color-code wards by HVI band; add a popup showing ward stats on click.
- **Member 4:** Build the dashboard chart shells (cooling-center capacity bar chart, temperature trend line chart) with placeholder data; build the feedback form UI (not wired yet).
- **Member 5:** Write a small integration test hitting all three services in sequence. Pair with Member 1 on the node-cron watcher skeleton (poll on an interval, log for now — no alerts yet).

**End-of-day Definition of Done:** the map on the frontend shows real wards, colored by real HVI scores pulled through Express from Mongo. **This is your backbone — protect it from here on.**

---

### Day 3 — Forecast, Risk Fusion, Alerts Go Live
**Goal:** the full "detect severe risk → fire a real alert" loop works, end to end.

- **Member 2:** Integrate Open-Meteo per ward (or per city centroid if ward-level forecast granularity isn't available — a reasonable, explainable simplification). Build the risk-fusion logic (HVI + forecast severity → tier). Write daily risk docs to Mongo, wrapped as an APScheduler job, plus a manual `/internal/recompute` trigger for demo control.
- **Member 1:** Finish the node-cron watcher: detect Severe/Extreme tiers, check `AlertLogs` to prevent duplicate sends (dedupe on `wardId-date-tier`), integrate the Twilio SDK for SMS to your team's **verified trial numbers**, and Firebase Admin for push (simplify to an in-app toast + one real device if Firebase setup starts eating too much time).
- **Member 3:** Wire the Simulation Toggle — clicking it calls `POST /api/simulate`, which force-sets a chosen ward to "Extreme," which the watcher picks up. Confirm the map re-colors within seconds.
- **Member 4:** Wire the feedback form to a real endpoint. Start the historical trend chart with real structure (pad with generated sample history if you only have 1–2 real days — be ready to say this openly if a judge asks).
- **Member 5:** Run the full pipeline end to end — trigger the simulation, confirm the SMS/push actually lands, confirm a second trigger doesn't double-send. File any bugs as GitHub issues. Start drafting the demo script (see `docs/DEMO_SCRIPT.md`).

**End-of-day Definition of Done:** toggle → risk tier updates → watcher detects → SMS/push fires → map recolors, live. **This is the moment judges remember most — get it solid today, not on Day 5.**

---

### Day 4 — Feature Completion & Full-Team Integration Testing
**Goal:** every architecture layer is visibly working in one deployed app.

- **Member 1:** Polish alert content (ward name, reason, actionable advisory per tier). Add a "suggested action" field for the authority dashboard. Harden error handling — what happens if Twilio or Mongo fails mid-request.
- **Member 2:** Add the "feedback loop" talking point — even a simple mechanism where a citizen heat-illness report nudges a ward's vulnerability score, visible on the dashboard, is enough to credibly demonstrate the concept.
- **Member 3:** Finish the citizen "check my area" page (search/select a ward → see current risk, nearest cooling center, advisory). Add Resources (cooling centers) as map markers.
- **Member 4:** Finish the cooling-center tracker and trend charts with realistic sample data. Full visual consistency pass — colors, fonts, spacing, mobile responsiveness for the citizen page.
- **Member 5:** Run a full team dress run of the demo script exactly as it will be presented. Log every glitch. Deploy all three services (Section 13) so you're demoing the live deployed app, not localhost.

**End-of-day Definition of Done:** all four architecture layers are visibly functioning in the deployed app; the team has run the demo, live, together, at least once.

---

### Day 5 — Polish, Rehearse, Bulletproof
**Goal:** nothing on stage depends on live network luck.

- **All (morning):** Bug bash — everyone tests every flow, files issues, fixes assigned live.
- **Member 1 & 2:** Precompute and cache a "known good" demo dataset — a specific city, a specific severe ward — so the live demo doesn't depend on a live GEE call or live weather call that could be slow or fail on venue wifi.
- **Member 3 & 4:** Final visual polish, fix any responsive/browser issues, test on the exact laptop/screen you'll present with.
- **Member 5:** Record a full backup demo video (screen recording) in case live wifi or an API fails on stage. Finalize the pitch deck. Time the pitch to fit your slot exactly. Prep answers for likely judge questions (Section 15). Confirm every member has 1–2 talking points ready for Q&A.
- **All (afternoon/evening):** Two full dress rehearsals, timed, in front of a "mock judge" (a friend, senior, or mentor) for honest feedback.

**End-of-day Definition of Done:** the deployed app works from a cold start; a backup video exists; the pitch is timed and rehearsed; every member can answer basic questions about every layer, not just their own part.

---

## 12. Common Mistakes That Sink Hackathon Teams (Avoid These Specifically)

1. **Building all four layers in isolation until the last day, then trying to connect them.** This plan forces a working vertical slice by Day 2 precisely to prevent this.
2. **Relying on a live GEE or weather API call during the actual demo.** Both can be slow or rate-limited at the worst moment. Cache your demo dataset (Day 5).
3. **Twilio trial account surprises.** Trial accounts can only SMS *verified* numbers. Verify your team's phones early, not five minutes before you present.
4. **Firebase push notifications eating a full day.** If setup drags, fall back to an in-app toast/alert banner plus one real phone for the "wow" moment — still demonstrates the concept.
5. **Nobody owns integration.** Assign it explicitly (Member 5) — don't assume it'll happen organically.
6. **Scope creep** — trying to cover the entire city instead of a focused 8–12 wards. A tight, accurate demo beats a sprawling, buggy one.
7. **A model nobody can explain.** If a judge asks "how does your risk score work" and the answer is "the AI decided," that's a red flag to them. Keep it explainable (Section 6, point 4).
8. **No offline backup.** Venue wifi fails. Have the recorded video ready, always.
9. **Skipping rehearsal timing.** Going over your slot cuts you off mid-pitch — rehearse against a timer, twice.
10. **Forgetting the social-equity narrative.** The tech is necessary but not sufficient — the "why this matters" framing (elderly, outdoor workers, low-cooling-access residents) is what makes judges remember your team.

---

## 13. Testing & QA Checklist (Run Before Day 5 Ends)

- [ ] Map loads and colors correctly on a cold browser load (no cache)
- [ ] Simulation Toggle triggers a tier change within a few seconds
- [ ] Alert fires exactly once per tier change (no duplicates on repeated triggers)
- [ ] Dashboard charts render with no console errors
- [ ] Citizen "check my area" page works for every demo ward
- [ ] Feedback form submits successfully and is visible somewhere (even a simple counter)
- [ ] App works on the actual presentation laptop/browser, not just a dev machine
- [ ] All three services survive a full restart (Mongo reconnects, cron resumes, frontend reloads cleanly)
- [ ] `POST /api/simulate` returns a success response within 2 seconds
- [ ] `GET /health` on the AI service responds (confirms cold-start is resolved)

---

## 14. Deployment Plan

| Service | Where | Notes |
|---|---|---|
| MongoDB | Atlas (already cloud) | Whitelist `0.0.0.0/0` temporarily for the demo to avoid IP-allowlist surprises on venue wifi. |
| FastAPI (ai-service) | Render or Railway free tier | Cold starts can be slow on free tiers — hit the health endpoint a few minutes before presenting to "wake it up." |
| Express (backend) | Render or Railway free tier | Same cold-start note applies. |
| React (frontend) | Vercel or Netlify | Fastest, most reliable free static hosting for a demo. |

Deploy by Day 4, not Day 5 — you want at least a full day of testing against the *real* deployed URLs, since localhost behavior and deployed behavior aren't always identical (CORS, environment variables, cold starts).

---

## 15. Demo Script — The Two-Minute Stage Flow

> **Full script with timing, fallback plans, and pre-stage checklist is in `docs/DEMO_SCRIPT.md`.**

1. **(15s) The hook:** "Heatwaves kill more people in India every year than floods, cyclones, and earthquakes combined — but every warning today is generic. We built a system that knows exactly which neighborhood, and which person, needs help first."
2. **(20s) Show the map:** Point at two wards with visibly different colors. "This ward has more elderly residents and less green cover — same weather forecast, but a completely different risk tier."
3. **(30s) Hit the Simulation Toggle:** Trigger a heatwave on the highest-risk ward live. Watch the map recolor.
4. **(20s) Show the alert land:** A real SMS arrives on a phone on stage, or show the push/toast firing. "This just went out automatically — no human had to notice and decide to send it."
5. **(25s) Flip to the authority dashboard:** Show cooling-center capacity and the suggested action ("open cooling center in Ward X").
6. **(10s) Close:** "Mitigation through the vulnerability index, response through targeted alerts — one system, both halves of the theme, built on entirely free public data."

Rehearse this exact sequence, timed, at least twice on Day 5.

---

## 16. Anticipated Judge Questions & Suggested Answers

- **"How is this different from IMD's existing heatwave warnings?"** — IMD gives city-wide weather forecasts. We add ward-level *vulnerability* awareness on top, so the same forecast produces different, targeted alerts depending on who actually lives there.
- **"How would you get ward-level demographic data for every city in India?"** — Census 2011 ward mapping is public but coarse; be honest that finer-grained data would need a data-sharing partnership with municipal corporations — this is a known, stated limitation, not something you're hiding.
- **"What about alert fatigue / false alarms?"** — Alerts only fire on a tier *change*, not every day at the same level, which keeps volume low and meaningful.
- **"How does this scale nationally, cost-wise?"** — GEE, Open-Meteo, and Census data are free; Twilio/Firebase costs scale with alert volume, which is naturally small because alerts are targeted, not blanket.
- **"Is this data real or simulated?"** — Be transparent: the pipeline and model are real; for demo purposes you focused on a curated set of wards and cached a "known good" dataset to keep the live demo reliable. Honesty here builds credibility, it doesn't cost you points.
- **"How accurate is your model?"** — Don't overclaim a number you haven't validated. Describe it as an explainable weighted index built on documented heat-vulnerability correlates (LST, elderly %, outdoor worker %, green cover), and say what you'd validate next with real outcome data.

---

## 17. Final Pre-Stage Checklist

- [ ] Laptop fully charged + charger packed
- [ ] Deployed app tested on venue-style wifi (mobile hotspot as backup)
- [ ] Backup demo video ready to play instantly if needed
- [ ] Twilio trial numbers verified and tested that morning
- [ ] Pitch timed to fit your exact slot
- [ ] Every member knows their 1–2 talking points for Q&A
- [ ] GitHub repo is clean, README is up to date, and the repo link works if judges ask for it
- [ ] Hit `/health` on AI service 5 minutes before your slot

---

## 18. Environment Variable Reference

All `.env.example` files are pre-created in each service folder. Copy them to `.env` and fill in your values.

| Variable | Service | Required? | Description |
|----------|---------|-----------|-------------|
| `MONGO_URI` | AI + Backend | Yes | MongoDB Atlas connection string |
| `MONGO_DB_NAME` | AI | Yes | Database name (default: `urban_heatwave`) |
| `GEE_PROJECT_ID` | AI | Yes | Google Earth Engine Cloud project ID |
| `GEE_SERVICE_ACCOUNT_KEY` | AI | No* | Path to GEE service account JSON key (*mock data used if missing) |
| `OPEN_METEO_BASE_URL` | AI | No | Defaults to `https://api.open-meteo.com/v1` |
| `SCHEDULER_HOUR` | AI | No | UTC hour for daily recompute (default: 6) |
| `HVI_WEIGHT_LST` | AI | No | LST weight in HVI formula (default: 0.35) |
| `HVI_WEIGHT_ELDERLY` | AI | No | Elderly % weight (default: 0.25) |
| `HVI_WEIGHT_OUTDOOR` | AI | No | Outdoor worker % weight (default: 0.25) |
| `HVI_WEIGHT_GREEN` | AI | No | Green cover weight (default: 0.15) |
| `TWILIO_ACCOUNT_SID` | Backend | Yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Backend | Yes | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Backend | Yes | Twilio verified sender number |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Backend | No* | Path to Firebase Admin SDK JSON key (*push skipped if missing) |
| `PORT` | Backend | No | Express port (default: 5000) |
| `AI_SERVICE_URL` | Backend | No | FastAPI URL (default: `http://localhost:8000`) |
| `VITE_API_BASE_URL` | Frontend | Yes | Express backend URL (e.g., `http://localhost:5000/api`) |

---

## 19. Stretch Goals (Only If You Finish Early)

- Voice/IVR alerts via Twilio in a local language
- Historical view: past heatwave events plotted against past alerts sent, to show timeliness
- Prophet/LSTM forecast layer as a "v2" on top of the explainable baseline model
- Real citizen-facing PWA with push notification opt-in

Don't touch these until every item in Sections 11–14 and the checklist in Section 17 is done. A polished MVP beats an ambitious, half-working stretch feature every time in front of judges.
