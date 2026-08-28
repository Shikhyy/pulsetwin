# Prototype Data

## Goal
Generate realistic illustrative production data rather than perfectly clean synthetic data.

## Factory
Use 30–50 stations across body construction, paint, and final assembly.

## Variables
Include:
- cycle time
- torque
- vibration
- temperature
- throughput
- queue length
- downtime
- equipment health
- operator variation
- part quality
- environmental conditions

## Imperfections
Include:
- missing sensors
- noisy signals
- intermittent faults
- manual checks
- delayed quality outcomes
- sensor outages
- changing production mix

## Ground Truth
The generator should maintain hidden labels for injected defects, bottleneck episodes, and equipment degradation so model evaluation is possible.
