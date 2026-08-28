# Backend Architecture

## Responsibilities
The backend owns:
- domain logic
- twin state
- event processing
- telemetry normalization
- predictions
- simulation orchestration
- recommendations
- authentication/authorization
- audit records
- API and real-time delivery

## Suggested Module Boundaries
The coding agent should derive exact modules for:
- plants
- lines
- stations
- assets
- production units
- telemetry
- events
- quality
- predictions
- simulation
- recommendations
- control
- users
- audit

## Rules
Keep controllers thin. Keep domain logic out of HTTP handlers. Use typed contracts. Validate external input. Centralize error handling.

## Real-Time
Expose only necessary state changes to connected clients. Prefer event streams or WebSockets for operational updates.
