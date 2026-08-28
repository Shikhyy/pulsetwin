# System Architecture

```text
                         PULSETWIN
                            |
        +-------------------+-------------------+
        |                   |                   |
   EXPERIENCE           TWIN CORE          INTELLIGENCE
        |                   |                   |
   +----+----+         +----+----+         +----+----+
   |    |    |         |    |    |         |    |    |
  3D   Ops Analytics  State Events History ML Rules Simulation
        |                   |                   |
        +-------------------+-------------------+
                            |
                       DATA PLATFORM
                            |
             +--------------+--------------+
             |              |              |
         Telemetry       Events         Quality
             |              |              |
             +--------------+--------------+
                            |
                      OT INTEGRATION
                            |
                  +---------+---------+
                  |         |         |
                 PLC      OPC UA     MQTT
```

## Architectural Boundaries
- Frontend never communicates directly with PLCs.
- ML models never directly control PLCs.
- Simulation never mutates live state.
- Control commands pass through a safety gateway.
- Rendering is isolated from business logic.
- Domain logic is independent of presentation.

## Deployment Direction
Prototype may run locally with containers. Production architecture should allow independently scalable frontend, API, event processing, ML inference, simulation, telemetry ingestion, and databases.
