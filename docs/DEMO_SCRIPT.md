# Demo Script — The Two-Minute Stage Flow

> Rehearse this exact sequence, timed, at least twice on Day 5.
> Total time: ~2 minutes.

---

## Setup (Before Going On Stage)

- [ ] Deployed app loaded on presenter laptop
- [ ] Dashboard page open in browser tab 1
- [ ] Citizen page open in browser tab 2
- [ ] Team member's phone ready to show incoming SMS
- [ ] Backup demo video ready in tab 3 (just in case)
- [ ] Hit the FastAPI `/health` endpoint 2 minutes before to wake up cold-start services

---

## The Script

### 1. The Hook (15 seconds)

> **Speaker:** "Heatwaves kill more people in India every year than floods, cyclones, and earthquakes combined — yet every warning today is generic and city-wide. We built a system that knows exactly which neighborhood, and which person, needs help first."

_Show the dashboard map. Let the colored wards speak visually._

---

### 2. Show the Map (20 seconds)

> **Speaker:** "Here's our live map of [City Name]. Each ward is colored by its Heat Vulnerability Index — not just temperature, but who actually lives there."

_Point to two wards with visibly different colors._

> "This ward has more elderly residents and less green cover — same weather forecast, but a completely different risk tier. That's the key innovation."

---

### 3. Trigger the Simulation (30 seconds)

> **Speaker:** "Let me show you what happens when a heatwave hits."

_Click the Simulation Toggle. Select the high-vulnerability ward. Set tier to "Extreme."_

> "Watch the map update in real time..."

_Ward recolors to red. Dashboard stats update._

> "The system just detected an Extreme risk in this ward and is dispatching alerts automatically."

---

### 4. Show the Alert (20 seconds)

_Hold up the phone showing the incoming SMS, or show the push notification._

> **Speaker:** "This SMS just arrived — automatically, targeted only to this specific ward. No human had to notice and decide to send it. The message includes the risk level, specific advisory, and the nearest cooling center."

---

### 5. Authority Dashboard (25 seconds)

_Switch to the dashboard view showing cooling-center capacity and suggested actions._

> **Speaker:** "Meanwhile, city authorities see this dashboard — cooling center capacity by ward, alert history, and suggested actions: 'Open additional cooling center in Ward X.' This is the response side."

_Point to the charts briefly._

> "We also track citizen feedback — heat illness reports flowing back in, closing the loop."

---

### 6. Close (10 seconds)

> **Speaker:** "Mitigation through vulnerability indexing, response through targeted alerts, and feedback closing the loop — one system, both halves of the disaster management theme, built entirely on free public data. Thank you."

---

## Timing Summary

| Segment | Duration | Cumulative |
|---------|----------|------------|
| Hook | 15s | 0:15 |
| Map | 20s | 0:35 |
| Simulation | 30s | 1:05 |
| Alert | 20s | 1:25 |
| Dashboard | 25s | 1:50 |
| Close | 10s | 2:00 |

---

## Emergency Fallbacks

| If this breaks... | Do this instead |
|-------------------|----------------|
| Live demo won't load | Play the backup video immediately |
| Simulation toggle doesn't update map | Refresh the page; if still broken, show pre-screenshot |
| SMS doesn't arrive | Say "SMS is dispatched via Twilio" and show the AlertLog in the dashboard |
| Charts don't render | Skip to the citizen page; come back if time permits |
| Venue wifi dies | Use mobile hotspot (pre-configured) |
