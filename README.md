# PulseTwin

**Industrial Digital Twin & Operational Intelligence Platform**

> Real-time predictive intelligence for mixed-model vehicle assembly lines.  
> Built for the Accenture Innovation Challenge 2026 — DigitalTwin.ai Track.

---

## What It Does

PulseTwin is a full-stack industrial digital twin that answers five questions for plant teams:

| # | Question | How PulseTwin answers it |
|---|---|---|
| 1 | What is happening? | Real-time 3D factory viewport — 40 stations, live telemetry, status colors |
| 2 | Why is it happening? | Root cause investigation via Digital Thread — traces quality issues upstream |
| 3 | What will happen next? | ML prediction engine: bottleneck, defect, and anomaly models with confidence intervals |
| 4 | What can we safely change? | Simulation sandbox — run what-if scenarios, compare outcomes before touching production |
| 5 | What would happen if we changed it? | Scenario comparison panel with throughput / defect-rate impact |

---

## Demo (30-second version)

```
docker compose up
```

Open `http://localhost:5173` → landing page → Sign In (any role) → live 3D factory.

At ~18 seconds (simulated 18 minutes at 60× acceleration):
- **ST-12** enters torque drift — anomaly detected, prediction fires
- **ST-18** (E-Coat Oven) develops a bottleneck — cycle time degrading
- Alert badge updates, pulse rings propagate through the 3D viewport
- Click ST-18 → StationInspector shows prediction at 88% confidence
- Switch to **Leadership** mode → KPI impact shown
- Switch to **Simulation** → run a what-if cycle time reduction

Or click **▸ Trigger Scenario** in the demo bar to force-fire the scenario instantly.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React + Three.js)          │
│  Landing → Login → 3D Viewport → Context Panels        │
└──────────────┬──────────────────────────────────────────┘
               │ WebSocket (event-driven, <50ms)
               │ REST (sim control, predictions)
┌──────────────▼──────────────┐   ┌────────────────────────┐
│   Backend (Fastify + Node)  │──▶│  ML Service (Python /  │
│   - WebSocket manager       │   │    FastAPI)             │
│   - Prediction engine       │   │  - Bottleneck model     │
│   - REST API (auth, plants, │   │    (HistGradBoost)      │
│     stations, simulations)  │   │  - Defect model         │
│   - Event fanout            │   │    (LogisticRegression) │
└──────────────┬──────────────┘   │  - Anomaly detector     │
               │                  │    (EWMA + z-score)     │
┌──────────────▼──────────────┐   └────────────────────────┘
│  Simulator (Node.js)        │
│  - Production engine (pull  │
│    system, buffer logic)    │
│  - Telemetry generator      │
│    (Gaussian noise, drift)  │
│  - PLC signal simulation    │
│  - Demo scenario engine     │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│  PostgreSQL 16              │
│  (stations, events,         │
│   telemetry, predictions)   │
└─────────────────────────────┘
```

---

## How It Addresses Round 2 Complexities

### Uneven Sensor Coverage
Every station has one of four instrumentation profiles:
- **RICH** (≥90% sensor coverage) — direct telemetry: torque, vibration, temperature, cycle time
- **PARTIAL** (≈68%) — some sensors, some manual
- **MANUAL_ONLY** (≈35%) — relies on manual inspection records
- **SENSOR_POOR** (≈38%) — legacy PLC tags only

The ML models account for data completeness in their confidence calculation:
```
confidence = completeness * 0.9 + 0.1
```
At sensor-poor stations, the system degrades gracefully — predictions are shown with lower confidence rather than fabricated.

### Multi-Causal Defects
The demo scenario chains three events:
1. Torque drift at ST-12 (equipment wear signature)
2. Resulting cycle time degradation at ST-18 (downstream consequence)
3. Vibration spike at ST-12 (sensor noise / bearing wear)

The Digital Thread traces a vehicle's full journey to show which stations contributed to a quality outcome.

### Live Production Constraints
The simulator models a realistic **pull system** with buffer capacity limits. Bottlenecks propagate naturally via blocking/starvation — the same mechanism as a real line.

### Multi-Stakeholder Views
| Mode | Target User | Focus |
|---|---|---|
| Operations | Floor supervisor | Real-time station status, alerts, pulses |
| Investigation | Process engineer | Digital Thread, root cause, evidence |
| Simulation | Process engineer / IE | What-if scenarios, outcome comparison |
| Planning | Plant manager | 7-day forecast, capacity utilization |
| Leadership | Plant director | OEE, FPY, prevented defects, savings |

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- (Optional) Node.js 20+ for local development

### Full Stack (recommended)
```bash
cp .env.example .env
docker compose up --build
```

Services start in order: postgres → ml → backend → simulator → frontend.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| ML Service | http://localhost:8000 |
| Simulator | http://localhost:3002 |
| Backend health | http://localhost:3001/health |
| ML health | http://localhost:8000/health |

### Local Frontend Development
```bash
cd frontend
npm install
npm run dev
```
The frontend works in a read-only / simulated state without the backend — WebSocket will retry and mock data is shown.

### Manually Trigger the Demo Scenario
```bash
curl -X POST http://localhost:3001/api/demo/trigger-scenario
```
Or click **▸ Trigger** in the demo bar at the bottom of the screen.

### Reset
```bash
curl -X POST http://localhost:3001/api/demo/reset
```

---

## ML Models

All models train on synthetic data automatically on first startup if no saved model is found.

| Model | Algorithm | Features | Target |
|---|---|---|---|
| Bottleneck predictor | `HistGradientBoostingClassifier` | cycle time trend, utilization, queue growth, equipment health, vibration z-score | P(bottleneck within horizon) |
| Defect predictor | `LogisticRegression` | torque deviation, temperature variance, inspection history, anomaly count | P(quality defect) |
| Anomaly detector | EWMA + 3σ | per-signal rolling statistics | anomaly flag per reading |

**Confidence handling**: Each prediction includes a `data_completeness` score (0–1) based on how many features had valid sensor readings. This is shown to operators — the system never pretends certainty at sensor-poor stations.

---

## Project Structure

```
pulsetwin/
├── frontend/           React + TypeScript + Three.js
│   └── src/
│       ├── app/        Shell, routing
│       ├── features/   Landing, auth, factory 3D, operations, investigation,
│       │               simulation, planning, leadership, navigation
│       ├── stores/     Zustand state (twin, predictions, UI, simulation)
│       └── hooks/      WebSocket, API, production unit
├── backend/            Node.js Fastify API + WebSocket
│   └── src/
│       ├── modules/    Auth, plants, stations, production, predictions,
│       │               simulation, recommendations, demo
│       ├── services/   Prediction engine (calls ML service)
│       └── realtime/   WebSocket manager + event fanout
├── simulator/          Production line simulation engine
│   └── src/
│       ├── factory/    Station layout (40 stations, 3 zones)
│       ├── production/ Pull system engine, state management
│       ├── telemetry/  Sensor data generator (Gaussian + drift)
│       ├── scenarios/  Demo scenario scripts (torque drift, bottleneck)
│       └── plc/        Simulated PLC tag layer
├── ml/                 Python FastAPI ML service
│   └── src/
│       ├── models/     Bottleneck, defect, anomaly models
│       ├── data/       Synthetic training data generator
│       └── features/   Feature extraction pipeline
├── postgres/           DB schema / migrations
├── docker-compose.yml  Full stack orchestration
└── .env.example        Environment variable template
```

---

## Design Principles

From the product spec:
- **Spatial before abstract** — the factory floor is the primary navigation surface
- **Evidence before prediction** — raw evidence is always visible alongside ML outputs
- **Confidence is visible** — never pretend certainty; sensor coverage shown explicitly
- **Safety before autonomy** — human operators remain accountable for all decisions
- **Progressive complexity** — operators see simple signals; engineers see evidence; leadership sees KPIs

---

## Assumptions

1. 40-station mixed-model assembly line (sedan/SUV, 70/30 split)
2. ~70% of stations richly instrumented; remaining 30% partial, manual, or sensor-poor
3. Production only paused for instrumentation upgrades during scheduled maintenance windows (modelled as read-only PLC integration)
4. Simulated time runs at 60× acceleration for demo purposes; real deployment would use wall-clock time
5. ML models are trained on synthetic data for the prototype; real deployment would use 3–6 months of historical production data

---

## Team

Built for the Accenture Innovation Challenge 2026 — DigitalTwin.ai Track, Round 2.
