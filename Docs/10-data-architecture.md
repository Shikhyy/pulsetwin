# Data Architecture

## Data Classes
- master data
- telemetry
- production events
- quality observations
- maintenance events
- manual observations
- predictions
- simulations
- recommendations
- audit logs

## Storage Direction
A prototype may use a relational database plus time-series-friendly structures. Production may introduce dedicated time-series/event infrastructure if scale requires it.

## Data Principles
- Preserve source timestamps.
- Preserve source identity.
- Preserve units.
- Preserve quality flags.
- Never silently convert missing values to zero.
- Make late-arriving data explicit.
- Version model outputs.
