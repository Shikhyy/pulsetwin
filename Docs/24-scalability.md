# Scalability

## Multi-Line
Twin entities must be scoped by plant, line, zone, and station.

## Multi-Plant
Do not hard-code layout, station counts, equipment models, or sensor availability.

## Configuration
Represent site-specific:
- layouts
- station metadata
- equipment
- signal mappings
- units
- production routes
- thresholds

as configuration/data rather than application code.

## Performance
Support incremental state updates, caching, batched historical queries, and scalable telemetry ingestion.

## Rollout
A new plant should primarily require configuration, mappings, asset packages, and model calibration rather than a forked application.
