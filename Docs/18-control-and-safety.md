# Control and Safety

## Safety Philosophy
PulseTwin is advisory by default.

No autonomous production control should be enabled merely because a prediction exists.

## Control Levels
1. Observe
2. Recommend
3. Simulate
4. Human-approved command
5. Controlled automation

The prototype should remain in levels 1–3 unless a fully simulated control loop is being demonstrated.

## Guardrails
Commands require:
- authenticated user
- authorization
- valid target
- safe range
- current state check
- explicit confirmation
- audit record

## Fail Safe
On uncertainty, stale state, communication loss, or invalid command, do not issue control.
