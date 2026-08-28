# Telemetry and Data Ingestion

## Sources
Support architecture for:
- PLC tags
- OPC UA
- MQTT
- historians
- MES
- quality systems
- manual inspection systems
- synthetic simulator

## Normalization
Normalize incoming data into a common observation model:
- timestamp
- source
- entity
- signal
- value
- unit
- quality
- freshness
- provenance

## Sensor Gaps
Represent missingness and partial observability explicitly.

## Prototype
Generate realistic synthetic telemetry with:
- normal variation
- drift
- noise
- intermittent anomalies
- missing signals
- delayed observations
