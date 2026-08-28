# OT/PLC Agent Prompt

Implement the PulseTwin OT architecture without requiring live industrial hardware.

Create a simulated PLC/data source capable of producing:
- machine state
- alarms
- counters
- cycle events
- telemetry

Create clear interfaces for future OPC UA and MQTT adapters.

Keep the initial production mode read-only.

Never connect frontend or ML directly to PLC interfaces.

Future commands must pass through validation, safety policy, human approval, control gateway, and audit.
