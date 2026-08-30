import React from 'react';
import { OrbitControls, Grid, Stars, Environment } from '@react-three/drei';
import FactoryGeometry from './geometry/FactoryGeometry';
import StationLayer from './geometry/StationLayer';
import ProductionUnitLayer from './geometry/ProductionUnitLayer';
import ConveyorLayer from './geometry/ConveyorLayer';
import PulseEffect from './effects/PulseEffect';
import { Fog } from 'three';

export default function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[30, 60, 30]}
        intensity={1.2}
        color="#D0E0F0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-20, 30, -20]} intensity={0.3} color="#4060A0" />
      <hemisphereLight groundColor="#0D0F12" color="#1A2840" intensity={0.6} />

      {/* Subtle fog for depth */}
      <fog attach="fog" args={['#0D0F12', 80, 200]} />

      {/* Factory geometry */}
      <FactoryGeometry />
      <ConveyorLayer />
      <StationLayer />
      <ProductionUnitLayer />
      <PulseEffect />

      {/* Ground grid — refined */}
      <Grid
        position={[0, -0.02, 0]}
        args={[240, 240]}
        cellSize={4}
        cellThickness={0.5}
        cellColor="#1C2030"
        sectionSize={20}
        sectionThickness={1}
        sectionColor="#252B3D"
        fadeDistance={120}
        fadeStrength={1.5}
        infiniteGrid
      />

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        target={[0, 0, 5]}
        minDistance={20}
        maxDistance={180}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
      />
    </>
  );
}
