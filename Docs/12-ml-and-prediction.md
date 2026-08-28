# ML and Predictive Intelligence

## Philosophy
Start with defensible, explainable methods rather than complex black-box models.

## Stack
Data quality → statistical monitoring → anomaly detection → feature engineering → predictive model → evidence aggregation → prediction → confidence.

## Candidate Methods
- SPC
- rolling statistics
- Isolation Forest
- logistic regression
- gradient boosting
- time-series features

## Bottleneck Prediction
Estimate probability of a station becoming a bottleneck within a defined horizon using cycle time trend, variance, utilization, queue size, blockage, starvation, downtime, health, production mix, and environment.

## Defect Prediction
Estimate probability of future quality failure using torque, vibration, temperature, cycle time, operator variation, part source, station history, and upstream anomalies.

## Explainability
Every prediction exposes:
- probability
- horizon
- contributing evidence
- confidence
- model version
- timestamp

Never describe correlation as proven causality.

## Validation
Track precision, recall, false-positive rate, false-negative rate, calibration, lead time, and intervention success.
