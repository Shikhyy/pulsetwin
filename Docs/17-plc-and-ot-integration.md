# PLC and OT Integration

## Strategy
READ → MIRROR → ANALYZE → SIMULATE → RECOMMEND → CONTROL

Avoid modifying live PLC logic as a prerequisite for the prototype.

## Interfaces
Support architecture for:
- OPC UA
- MQTT
- PLC tags
- historians
- MES
- quality systems
- manual observations

## Prototype
Use a simulated PLC producing machine states, cycle events, alarms, counters, and telemetry.

## Production Direction
Start with read-only integration.

## Control Gateway
Future commands follow:
Recommendation → Policy Validation → Safety Check → Human Approval → Control Gateway → PLC.

## Hard Rule
Frontend, ML models, and simulation must never directly access PLC control interfaces.

## Audit
Record user, timestamp, target, previous state, requested state, approval, and result.
