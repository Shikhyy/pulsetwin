# Bottleneck Engine

## Objective
Identify current and emerging production constraints.

## Signals
Use:
- cycle time
- utilization
- queue length
- starvation
- blockage
- downtime
- failure frequency
- downstream capacity
- upstream capacity

## Outputs
For each station:
- current bottleneck status
- future bottleneck probability
- expected time to impact
- contributing signals
- affected downstream stations

## Prototype
Use a transparent scoring or supervised model first. Ensure synthetic data contains labeled bottleneck episodes for validation.
