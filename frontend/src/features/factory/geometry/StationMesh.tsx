import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Outlines } from '@react-three/drei';
import * as THREE from 'three';

export type StationStatus = 'RUNNING' | 'IDLE' | 'BLOCKED' | 'STARVED' | 'DEGRADED' | 'MAINTENANCE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

interface Props {
  stationId: string;
  name: string;
  externalId: string;
  position: [number, number, number];
  status: StationStatus;
  riskLevel: number;
  isSelected: boolean;
  onSelect: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  RUNNING: '#1A3D2A', normal: '#1A3D2A',
  IDLE: '#4A5270',
  BLOCKED: '#3D2A0A',
  STARVED: '#3D2A0A', warning: '#3D2A0A', WARNING: '#3D2A0A',
  DEGRADED: '#3D2A0A',
  MAINTENANCE: '#0A2A3D',
  CRITICAL: '#3D0A0A', critical: '#3D0A0A',
  OFFLINE: '#1C2030'
};

export default function StationMesh({ stationId, externalId, position, status, riskLevel, isSelected, onSelect }: Props) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const color = STATUS_COLORS[status] || STATUS_COLORS.RUNNING;
  const isPulsing = status === 'WARNING' || status === 'CRITICAL';

  useFrame(({ clock }) => {
    if (meshRef.current && isPulsing) {
      const scale = 1 + Math.sin(clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    } else if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group 
      position={position} 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      <group ref={meshRef}>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[4, 1.5, 4]} />
          <meshStandardMaterial color={hovered ? '#3B4468' : '#252B3D'} />
          {isSelected && <Outlines thickness={0.1} color="#3B82F6" />}
        </mesh>
        
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[3, 2, 2]} />
          <meshStandardMaterial color={color} emissive={isPulsing ? color : '#000'} emissiveIntensity={0.6} />
        </mesh>
      </group>

      {riskLevel > 0.5 && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 3, 32]} />
          <meshBasicMaterial color="#C8902A" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Text position={[0, 4.5, 0]} fontSize={0.8} color="#E8ECF4" anchorX="center" anchorY="bottom">
        {externalId}
      </Text>
    </group>
  );
}
