# Database Schema

## Core Tables
Suggested entities:
- plants
- lines
- zones
- stations
- equipment
- production_units
- sensors
- observations
- events
- quality_observations
- predictions
- scenarios
- simulation_results
- recommendations
- control_commands
- users
- audit_logs

## Requirements
Use foreign keys where appropriate. Index high-volume query paths. Store units and timestamps. Keep model version information with predictions.

The coding agent may adapt the exact schema to the chosen database and performance requirements.
