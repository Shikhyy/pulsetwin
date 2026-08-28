# Frontend Architecture

## Preferred Stack
- React
- TypeScript
- Vite
- WebGL-based 3D renderer
- Three.js ecosystem or equivalent
- WebSocket for live state

Exact implementation choices may evolve.

## Main Views
- Operations
- Investigation
- Simulation
- Planning
- Assets
- Control
- System

## Experience Structure
The factory is the primary navigation surface. Do not begin with a generic KPI-card dashboard.

## Component Responsibilities
The coding agent must design the exact hierarchy. The system should support:
- application shell
- navigation
- factory viewport
- station visualization
- vehicle visualization
- flow visualization
- risk visualization
- health visualization
- station inspector
- telemetry charts
- prediction panel
- evidence panel
- digital thread
- simulation controls
- scenario comparison
- recommendation panel
- notifications
- data quality indicators
- command confirmation
- audit history

## State Separation
Keep UI state, twin state, historical state, prediction state, and simulation state separate.

## Real-Time
Prefer event-driven updates. Avoid refreshing the whole application for a single station change.
