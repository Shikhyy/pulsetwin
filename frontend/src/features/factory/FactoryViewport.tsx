import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import { Loader } from '@react-three/drei';

export default function FactoryViewport() {
  return (
    <div className="w-full h-full bg-root relative">
      <Canvas
        camera={{ position: [0, 65, 80], fov: 42, near: 0.1, far: 500 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        shadows
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0D0F12']} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* 3D loading overlay */}
      <Loader
        containerStyles={{ background: '#0D0F12', zIndex: 10 }}
        innerStyles={{ background: '#141720', borderRadius: '2px', border: '1px solid #2A3048' }}
        barStyles={{ background: '#3B82F6' }}
        dataStyles={{ color: '#8B93AB', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
        dataInterpolation={(p) => `Loading factory model… ${p.toFixed(0)}%`}
      />

      {/* Corner overlay: controls hint */}
      <div className="absolute bottom-10 left-4 flex flex-col gap-1 pointer-events-none opacity-40">
        <div className="text-[9px] font-mono text-text-muted">Scroll · zoom  ·  Drag · orbit  ·  Right-drag · pan</div>
      </div>
    </div>
  );
}
