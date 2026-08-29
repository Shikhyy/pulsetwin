import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

export default function FactoryViewport() {
  return (
    <div className="w-full h-full bg-root">
      <Canvas camera={{ position: [0, 50, 50], fov: 45 }}>
        <color attach="background" args={['#0D0F12']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} color="#E8ECF4" />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
