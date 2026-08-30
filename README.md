<div align="center">
  <img src="https://raw.githubusercontent.com/Shikhyy/pulsetwin/master/frontend/public/favicon.svg" alt="PulseTwin Logo" width="80" height="80">
  <h1 align="center">PulseTwin | DigitalTwin.ai</h1>
  <p align="center">
    <strong>Accenture Innovation Challenge 2026 — Round 2 Finalist Submission</strong>
  </p>
  <p align="center">
    A predictive digital twin for hybrid assembly lines. Built to observe the present, understand the anomalies, and predict the bottlenecks—before they stop production.
  </p>

  <p align="center">
    <a href="https://pulsetwin-frontend.onrender.com"><strong>🔴 View Live Demo</strong></a> ·
    <a href="#how-it-addresses-round-2-complexities"><strong>Read the Business Case</strong></a>
  </p>
</div>

<hr />

## 🚀 The Problem & Our Solution
In modern manufacturing, assembly lines are rarely perfectly instrumented. They are a messy patchwork of state-of-the-art robotics and decades-old legacy equipment. 

**PulseTwin** bridges this gap. By combining real-time 3D spatial mapping with a hybrid machine learning engine, it takes sparse, uneven telemetry data and generates highly accurate predictive maintenance and bottleneck alerts. It doesn't just tell you a machine broke; it tells you a machine *will* break, and exactly how to adjust the line to prevent it.

## 🌟 Key Features

* **Real-time 3D Factory Floor:** An interactive WebGL (`Three.js`) visualization of a 40-station assembly line.
* **Predictive AI Engine:** Machine learning models (`HistGradientBoostingClassifier`, `LogisticRegression`) that forecast starvation and bottlenecks up to 18 minutes in advance.
* **Graceful Degradation for Legacy Gear:** The AI explicitly calculates "data completeness." If a legacy station lacks sensors, the UI transparently shows lower confidence scores rather than hallucinating data.
* **Multi-Stakeholder Dashboards:** Specialized views tailored for Floor Operators, Process Engineers, and Plant Directors.
* **1-Click Cloud Architecture:** Fully deployed on Render with an automated infrastructure blueprint.

---

## 🏗️ Architecture

PulseTwin is an enterprise-grade, event-driven microservices architecture:

```mermaid
graph TD
    UI[Frontend (React + Three.js)] <-->|WebSocket & REST| API[Node.js Fastify Backend]
    API <-->|HTTP| ML[Python FastAPI ML Engine]
    API <-->|SQL| DB[(PostgreSQL)]
    SIM[Node.js Simulator Engine] -->|REST Push| API
```

* **Frontend:** React, TypeScript, TailwindCSS, Zustand, React Three Fiber.
* **Backend:** Node.js, Fastify, Drizzle ORM, WebSockets.
* **ML Service:** Python, FastAPI, Scikit-Learn, Pandas.
* **Simulator:** A custom pull-system physics engine that simulates realistic conveyor drift and torque anomalies.
* **Infrastructure:** 1-Click Render Blueprint (`render.yaml`).

---

## 🏭 The Demo Scenario (ST-12 to ST-18)

We built a live scenario to demonstrate the platform to the judges. You can trigger this at any time using the **DEMO** bar at the bottom of the UI.

1. **The Catalyst:** A subtle 4% torque drift begins at **ST-12** (Robotic Welding). Legacy systems miss this because it hasn't failed yet, but our ML Anomaly Detector catches the pattern and emits a warning pulse.
2. **The Ripple Effect:** The slight slowdown at ST-12 means parts stop reaching downstream stations on time. 
3. **The Prediction:** The AI calculates the exact buffer limits and predicts a catastrophic starvation event at **ST-18** (E-Coat Oven) in 18 minutes.
4. **The Resolution:** The Recommendation Engine generates an actionable fix: *Reduce feed rate at ST-12 by 15% to clear the buffer without halting the oven.*

---

## ☁️ Cloud Deployment (Render)

This repository includes a `render.yaml` Blueprint for 1-click cloud deployment.

1. Fork this repository.
2. Go to [Render](https://dashboard.render.com).
3. Click **New > Blueprint** and select your fork.
4. Render will automatically provision:
   * PostgreSQL Database
   * Python ML Service
   * Node.js Backend API
   * Node.js Simulator
   * Vite Static Frontend

---

## 💻 Local Development

If you prefer to run the architecture locally via Docker:

```bash
# 1. Setup Environment
cp .env.example .env

# 2. Boot the cluster (Postgres, Backend, ML, Simulator)
docker compose up --build -d

# 3. Start the Frontend
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`.

---

## 🧠 How It Addresses Round 2 Complexities

### 1. Uneven Sensor Coverage
Every station in PulseTwin has one of four instrumentation profiles: `RICH` (≥90% coverage), `PARTIAL`, `MANUAL_ONLY`, or `SENSOR_POOR` (PLC tags only). The ML models weight their predictions based on this profile. At sensor-poor stations, predictions are shown with lower confidence, ensuring operators never trust fabricated data.

### 2. Multi-Causal Defects
The demo scenario chains multiple events (torque drift causing downstream cycle time degradation). The **Digital Thread** feature traces a vehicle's full journey to show exactly which combination of stations contributed to a quality defect.

### 3. Human-in-the-Loop AI
PulseTwin strictly adheres to the principle of *Safety before Autonomy*. AI recommendations (like slowing down a feed rate) are presented to the operator as 1-click actions, but the system never autonomously changes machine parameters without human approval.

<div align="center">
  <br/>
  <p><i>Built for the Accenture Innovation Challenge 2026</i></p>
</div>
