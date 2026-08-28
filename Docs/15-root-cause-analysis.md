# Root Cause Analysis

## Principle
PulseTwin ranks possible contributors; it does not automatically declare causality.

## Investigation Graph
Quality event → production unit → upstream stations → observations → anomalies → maintenance → material/part context → environmental context.

## Contributor Ranking
Rank by evidence strength, temporal relationship, historical association, and consistency across comparable events.

## UI Language
Use:
- possible contributor
- supporting evidence
- confidence
- unresolved hypothesis

Avoid:
- "the AI found the cause"
unless causality has been independently validated.
