# Digital Twin Model

## Core Entities
- Plant
- ProductionLine
- Zone
- Station
- Machine
- Equipment
- ProductionUnit
- Buffer
- Sensor
- Observation
- Event
- QualityObservation
- Prediction
- Scenario
- SimulationResult
- Recommendation
- ControlCommand

## State Classes
Every important value should preserve whether it is:
- MEASURED
- INFERRED
- PREDICTED
- SIMULATED
- UNKNOWN

## Twin Identity
Entities require stable IDs independent of display names.

## State Model
Current state should be reconstructable from recent events and observations. Historical state must remain queryable.

## Relationships
ProductionUnit → visits → Station
Station → contains → Equipment
Equipment → emits → Observation
Observation → contributes_to → Prediction
ProductionUnit → generates → QualityObservation
Prediction → supports → Recommendation
Scenario → produces → SimulationResult
