# API Contracts

> Agreed on **Day 1** — everyone builds against these shapes.
> Changes require a team-wide announcement.

---

## MongoDB Collections

### `wards`

```js
{
  _id: ObjectId,
  wardId: String,           // unique identifier (e.g., "AHM-W03")
  name: String,             // human-readable name (e.g., "Jamalpur Ward")
  cityId: String,           // city slug (e.g., "ahmedabad")
  boundary: {               // GeoJSON Polygon
    type: "Polygon",
    coordinates: [[[lng, lat], ...]]
  },
  population: Number,
  pctElderly: Number,       // 0.0 – 1.0
  pctOutdoorWorkers: Number, // 0.0 – 1.0
  greenCoverPct: Number,    // 0.0 – 1.0
  createdAt: Date,
  updatedAt: Date
}
```

### `dailyrisks`

```js
{
  _id: ObjectId,
  wardId: String,           // references wards.wardId
  date: String,             // ISO date "2026-08-10"
  hvi: Number,              // 0–100 vulnerability index
  forecastTempC: Number,    // forecast max temperature
  forecastHumidity: Number, // forecast relative humidity %
  riskTier: String,         // "Low" | "Moderate" | "Severe" | "Extreme"
  computedAt: Date,         // when the AI service computed this
  isSimulated: Boolean      // true if set via simulation toggle
}
```

### `alertlogs`

```js
{
  _id: ObjectId,
  wardId: String,
  tier: String,             // "Severe" | "Extreme"
  channel: String,          // "sms" | "voice" | "push"
  recipientPhone: String,   // masked in logs
  sentAt: Date,
  dedupeKey: String,        // "${wardId}-${date}-${tier}" — prevents double-sends
  status: String            // "sent" | "failed" | "skipped"
}
```

### `resources`

```js
{
  _id: ObjectId,
  wardId: String,
  type: String,             // "cooling_center" | "water_station" | "medical_camp"
  name: String,
  address: String,
  capacity: Number,
  currentOccupancy: Number,
  status: String,           // "open" | "closed" | "full"
  lat: Number,
  lng: Number,
  updatedAt: Date
}
```

### `feedback`

```js
{
  _id: ObjectId,
  wardId: String,
  reportType: String,       // "heat_illness" | "infrastructure_issue" | "general"
  description: String,
  severity: String,         // "mild" | "moderate" | "severe"
  reportedAt: Date,
  contactPhone: String      // optional
}
```

---

## Express REST Endpoints

Base URL: `http://localhost:5000/api`

### Wards

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `GET` | `/wards` | All wards with latest risk tier joined | `Ward[] + latestRisk` |
| `GET` | `/wards/:wardId` | Single ward details | `Ward + latestRisk` |

### Risk

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `GET` | `/wards/:wardId/risk` | Risk history for a ward | `DailyRisk[]` |
| `GET` | `/risk/latest` | Latest risk for all wards | `DailyRisk[]` |

### Alerts

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `GET` | `/alerts` | Recent alert log (last 50) | `AlertLog[]` |
| `GET` | `/alerts?wardId=X` | Alerts for a specific ward | `AlertLog[]` |

### Resources

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `GET` | `/resources` | All resources | `Resource[]` |
| `GET` | `/resources?type=cooling_center` | Filter by type | `Resource[]` |
| `PUT` | `/resources/:id` | Update occupancy/status | `Resource` |

### Feedback

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `POST` | `/feedback` | Submit citizen heat-illness report | `{ success, id }` |

### Simulation (Demo Only)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `POST` | `/simulate` | Force a risk tier for demo | `{ success, wardId, tier }` |

**Request body:**
```json
{ "wardId": "AHM-W03", "tier": "Extreme" }
```

---

## FastAPI Internal Endpoints

Base URL: `http://localhost:8000`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/internal/recompute` | Force full HVI + risk fusion recompute |
| `GET` | `/internal/status` | Last computation timestamp + stats |

---

## Common Response Envelope

All Express endpoints return:

```json
{
  "success": true,
  "data": { ... },
  "message": "optional message",
  "error": null
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "message": "Human-readable error",
  "error": { "code": "WARD_NOT_FOUND", "details": "..." }
}
```
