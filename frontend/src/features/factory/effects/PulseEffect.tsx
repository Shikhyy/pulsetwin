import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTwinStore } from '../../../stores/twinStore';
import { FACTORY_CONFIG } from '../../../lib/factory-config';
import * as THREE from 'three';

function PulseRing({ event, onComplete }: { event: any, onComplete: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const station = FACTORY_CONFIG.stations.find(s => s.id === event.stationId);
  const color = event.type === 'bottleneck' ? '#C8902A' : '#2A6EC8';

  useFrame(() => {
    if (!meshRef.current || !station) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 3) {
      onComplete(event.id);
      return;
    }
    const progress = elapsed / 3;
    const radius = 2 + progress * 10;
    const scale = radius / 2;
    meshRef.current.scale.set(scale, scale, 1);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - progress);
  });

  if (!station) return null;

  return (
    <mesh ref={meshRef} position={[station.position[0], 0.1, station.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.8, 2, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function PulseEffect() {
  const { pulseEvents, removePulseEvent } = useTwinStore();
  
  return (
    <group>
      {pulseEvents.map(ev => (
        <PulseRing key={ev.id} event={ev} onComplete={removePulseEvent} />
      ))}
    </group>
  );
}
