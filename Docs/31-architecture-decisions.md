# Architecture Decisions

This document records significant technical decisions.

## ADR Template
### ADR-XXX — Title
Date:
Status:
Context:

Decision:

Alternatives considered:

Consequences:

Validation:

## Initial Decisions
### ADR-001 — 3D as primary spatial interface
Decision: The factory viewport is a primary operational surface, not a decorative visualization.

### ADR-002 — Separate live and simulated state
Decision: Simulation must never mutate live twin state.

### ADR-003 — Read-only OT first
Decision: Initial PLC integration is read-only or simulated.

### ADR-004 — Layered predictive intelligence
Decision: Use explainable statistical and ML techniques before complex black-box models.

### ADR-005 — Explicit uncertainty
Decision: Observability and prediction confidence are first-class twin properties.
