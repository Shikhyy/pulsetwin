import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FACTORY_CONFIG } from '../../../lib/factory-config';

interface Props {
  unitId: string;
  currentStationId: string;
  qualityRisk: number;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ProductionUnitMesh({ unitId, currentStationId, qualityRisk, isSelected, onSelect }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const station = FACTORY_CONFIG.stations.find(s => s.id === currentStationId);
    if (station) {
      targetPos.current.set(station.position[0], station.position[1], station.position[2]);
      groupRef.current.position.lerp(targetPos.current, 0.05);
    }
  });

  const bodyColor = qualityRisk > 0.7 ? '#3D0A0A' : qualityRisk > 0.4 ? '#3D2A0A' : '#1A3D2A';

  return (
    <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[5, 1, 2.5]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[3, 0.8, 2]} />
        <meshStandardMaterial color="#4A5270" />
      </mesh>
      {isSelected && (
        <mesh position={[0, 3, 0]}>
          <coneGeometry args={[0.5, 1, 4]} />
          <meshBasicMaterial color="#3B82F6" wireframe />
        </mesh>
      )}
    </group>
  );
}
