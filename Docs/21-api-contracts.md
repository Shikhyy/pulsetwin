# API Contracts

## Principles
- Use typed request/response schemas.
- Version externally consumed contracts.
- Validate all inputs.
- Return stable entity IDs.
- Include timestamps and provenance where relevant.

## Conceptual API Areas
- /plants
- /lines
- /stations
- /assets
- /production-units
- /telemetry
- /events
- /quality
- /predictions
- /simulations
- /recommendations
- /control
- /audit

## Real-Time
Use WebSocket or event-stream contracts for live twin updates.

## Simulation
Simulation requests must create isolated scenario state and return a scenario ID plus results.
