# Architecture Agent Prompt

Act as PulseTwin's principal software architect.

Before implementation, inspect all product documentation and produce an implementation architecture.

Design:
- frontend
- backend
- 3D
- twin core
- data
- ML
- simulation
- OT
- infrastructure
- testing

For each major component document:
- responsibility
- inputs
- outputs
- dependencies
- state ownership
- interfaces
- failure behavior

Prevent:
- circular dependencies
- UI → database coupling
- UI → PLC coupling
- ML → PLC coupling
- renderer → database coupling
- domain → presentation coupling

Do not over-engineer. Optimize for prototype value and future extensibility.

Create:
docs/generated/component-architecture.md
docs/generated/dependency-map.md
docs/generated/architecture-review.md

Then self-review the architecture before implementation.
