# Deployment

## Prototype
Provide a reproducible local development environment.

Recommended:
- Docker Compose
- frontend service
- backend service
- database
- simulator/data generator
- optional ML service

## Environment
Use .env.example and never commit secrets.

## Health
Every service should expose a basic health check.

## Production Direction
Allow separate deployment/scaling of frontend, API, ingestion, event processing, ML inference, simulation, and databases.

## OT
Keep OT connectivity isolated and separately secured.
