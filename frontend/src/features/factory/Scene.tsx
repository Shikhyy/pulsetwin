import React from 'react';
import { OrbitControls, Grid } from '@react-three/drei';
import FactoryGeometry from './geometry/FactoryGeometry';
import StationLayer from './geometry/StationLayer';
import ProductionUnitLayer from './geometry/ProductionUnitLayer';
import ConveyorLayer from './geometry/ConveyorLayer';
import PulseEffect from './effects/PulseEffect';

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 50, 20]} intensity={1.5} color="#E8ECF4" />
      <hemisphereLight groundColor="#0D0F12" color="#2A3048" intensity={0.5} />
      
      <FactoryGeometry />
      <ConveyorLayer />
      <StationLayer />
      <ProductionUnitLayer />
      <PulseEffect />

      <Grid position={[0, -0.01, 0]} args={[200, 200]} cellSize={5} cellThickness={1} cellColor="#1C2030" sectionSize={20} sectionThickness={1.5} sectionColor="#2A3048" fadeDistance={150} />
      
      <OrbitControls makeDefault position={[0, 60, 80]} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2 - 0.05} />
    </>
  );
}
