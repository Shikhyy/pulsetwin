# 3D Experience

## Purpose
The 3D factory is operational visualization, not decoration.

## Layer Model
```text
Factory Geometry
      ↓
Equipment
      ↓
Production Units
      ↓
Production Flow
      ↓
Operational State
      ↓
Risk
      ↓
Predictions
      ↓
Simulation
      ↓
Interaction
```

Each layer should be independently controllable.

## Visualize
- factory zones
- lines
- stations
- equipment
- production units
- buffers
- routes
- state
- health
- risk
- predictions
- simulations

## Interaction
Support free navigation, station focus, line focus, vehicle focus, incident focus, hover, selection, and saved viewpoints.

## State Encoding
Do not rely on color alone. Combine geometry, motion, labels, icons, intensity, outlines, and patterns.

## Digital Thread
Selecting a vehicle reveals its journey through stations, observations, anomalies, inspections, and quality outcomes.

## Simulation
Live/observed state must remain visually distinct from simulated and predicted state.

## Performance
Use instancing, LOD, asset caching, frustum culling, selective animation, and scene partitioning where appropriate.

## Assets
Start with procedural geometry. Abstract asset loading so GLTF/GLB assets can replace it later.

## Rendering Rule
3D must improve operational comprehension and never become a game-like distraction.
