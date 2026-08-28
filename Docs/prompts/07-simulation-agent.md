# Simulation Agent Prompt

Implement a deterministic discrete-event simulation for the production line.

Support:
- station cycle times
- buffers
- queues
- starvation
- blockage
- downtime
- production units
- quality events

Allow scenario interventions such as changing cycle time, downtime rate, or capacity.

Never mutate live state.

Return:
- throughput
- queue growth
- utilization
- bottleneck impact
- quality impact
- production loss
- recovery time

Support baseline vs scenario comparison.
