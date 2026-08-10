# Architecture Decisions

> Fill this document out on **Day 1, Hour 1** — before anyone writes code.
> These decisions prevent scope drift and integration bugs.

---

## 1. Target City

**City:** _(e.g., Ahmedabad, Hyderabad, Nagpur)_

**Rationale:** _(Why this city? Data availability? Narrative strength?)_

**Ward data source:** _(URL or file path to ward boundary GeoJSON)_

**Demographic data source:** _(Census 2011 ward-level data URL)_

---

## 2. Demo Scope

**Number of wards:** _(Recommend 8–12)_

**Selected wards (by name or ID):**

| Ward ID | Ward Name | Why selected |
|---------|-----------|--------------|
| | | High vulnerability (dense, low green cover) |
| | | Low vulnerability (affluent, high green cover) |
| | | Medium — for contrast |
| | | _(add more rows)_ |

---

## 3. Alert Channel Priority

| Channel | Priority | Notes |
|---------|----------|-------|
| SMS (Twilio) | **Must-have** | Fast to wire, reliable demo |
| Firebase Push | Nice-to-have | Only if Day 4 finishes early |
| Voice/IVR (Twilio) | Stretch | Only if everything else is solid |

---

## 4. Forecasting Model Approach

**Primary:** Transparent weighted-scoring model (HVI)

**Why:** Explainable in one sentence to judges. Can defend under Q&A pressure.

**Stretch (v2):** Prophet time-series layer on top, only if primary model ships by Day 3.

---

## 5. HVI Formula

```
HVI = w1 * LST_zscore + w2 * pct_elderly + w3 * pct_outdoor_workers + w4 * (1 - green_cover_pct)
```

**Default weights (tune in `notebooks/`):**

| Factor | Weight | Rationale |
|--------|--------|-----------|
| LST z-score | 0.35 | Direct heat measurement |
| % Elderly (65+) | 0.25 | Physiological vulnerability |
| % Outdoor workers | 0.25 | Exposure vulnerability |
| Inverse green cover | 0.15 | Lack of natural cooling |

---

## 6. Risk Tier Thresholds

| Tier | HVI + Forecast Score Range | Color |
|------|---------------------------|-------|
| Low | 0–25 | `#22c55e` (green) |
| Moderate | 26–50 | `#f59e0b` (amber) |
| Severe | 51–75 | `#f97316` (orange) |
| Extreme | 76–100 | `#ef4444` (red) |

---

## 7. Google Earth Engine Access

- [ ] GEE Cloud project registered
- [ ] Service account created
- [ ] API access approved
- [ ] Test query runs successfully

**GEE Project ID:** _________________

---

## 8. Deployment Targets

| Service | Platform | URL |
|---------|----------|-----|
| MongoDB | Atlas (M0 free) | |
| FastAPI (ai-service) | Render / Railway | |
| Express (backend) | Render / Railway | |
| React (frontend) | Vercel / Netlify | |
