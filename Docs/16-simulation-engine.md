# Simulation Engine

## Purpose
Test operational changes safely without mutating live production state.

## Principle
LIVE STATE ≠ SIMULATION STATE.

## Scenario
A scenario contains:
- baseline reference
- interventions
- horizon
- assumptions
- model version

Example:
```json
{
  "station": "ST-18",
  "parameter": "cycle_time",
  "change": "+8%",
  "duration": "30m"
}
```

## Outputs
Calculate:
- throughput
- queue growth
- utilization
- bottleneck probability
- quality impact
- downtime
- production loss
- recovery time

## Comparison
Baseline vs scenario should show deltas and affected stations.

## Prototype
Use discrete-event simulation with 30–50 stations, variable cycle times, buffers, failures, quality events, and production units.

## Future
Architecture should allow higher-fidelity or physics-informed models later.
