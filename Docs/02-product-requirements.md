# Product Requirements

## Functional Requirements

### Factory Visualization
Provide an interactive 3D representation of factory zones, lines, stations, equipment, production units, buffers, and material flow.

### Station Monitoring
Users can inspect cycle time, throughput, downtime, health, quality risk, sensor coverage, and recent events.

### Predictive Intelligence
Predict bottleneck risk, quality risk, and equipment anomalies.

### Root Cause Exploration
Allow users to trace quality event → production unit → upstream stations → telemetry → events → possible contributors.

### Simulation
Allow what-if scenarios without modifying live production.

### Recommendations
Recommendations contain proposed intervention, expected impact, confidence, supporting evidence, affected stations, and risks.

### Manual Data
Manual inspections are first-class observations.

### Data Quality
Show instrumentation coverage and data freshness.

### PLC/OT
Support OPC UA, MQTT, simulated PLC, and read-only production mode.

## Non-Functional Requirements
- Modular architecture.
- Deterministic demo scenarios.
- Explainable predictions.
- Explicit uncertainty.
- Clear separation of live, predicted, and simulated state.
- Safe control boundaries.
- Scalable from one line to multiple plants.
