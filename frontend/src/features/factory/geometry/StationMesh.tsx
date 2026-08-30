import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Outlines, Billboard, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export type StationStatus =
  | 'RUNNING' | 'IDLE' | 'BLOCKED' | 'STARVED'
  | 'DEGRADED' | 'MAINTENANCE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

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

const STATUS_COLOR: Record<string, string> = {
  RUNNING:     '#1A3D2A',
  IDLE:        '#252B3D',
  BLOCKED:     '#3D2A0A',
  STARVED:     '#3D2A0A',
  WARNING:     '#3D2A0A',
  DEGRADED:    '#2A2A0A',
  MAINTENANCE: '#0A2A3D',
  CRITICAL:    '#3D0A0A',
  OFFLINE:     '#1C2030',
};

const STATUS_EMISSIVE: Record<string, string> = {
  RUNNING:     '#2A9D4E',
  WARNING:     '#C8902A',
  CRITICAL:    '#B83030',
  DEGRADED:    '#C85A2A',
  MAINTENANCE: '#2A6EC8',
  IDLE:        '#000000',
  BLOCKED:     '#000000',
  STARVED:     '#000000',
  OFFLINE:     '#000000',
};

const STATUS_EMISSIVE_INTENSITY: Record<string, number> = {
  RUNNING: 0.15, WARNING: 0.5, CRITICAL: 0.8, DEGRADED: 0.4,
  MAINTENANCE: 0.3, IDLE: 0, BLOCKED: 0, STARVED: 0, OFFLINE: 0,
};

export default function StationMesh({
  stationId, externalId, position, status, riskLevel, isSelected, onSelect,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  const isPulsing = status === 'WARNING' || status === 'CRITICAL';
  const isActive = status === 'RUNNING';
  const bodyColor = STATUS_COLOR[status] ?? STATUS_COLOR.RUNNING;
  const emissive = STATUS_EMISSIVE[status] ?? '#000000';
  const emissiveIntensity = STATUS_EMISSIVE_INTENSITY[status] ?? 0;

  // Pre-compute material to avoid GC churn
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: bodyColor,
    emissive,
    emissiveIntensity,
    roughness: 0.6,
    metalness: 0.3,
  }), [bodyColor, emissive, emissiveIntensity]);

  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: hovered ? '#2A3048' : '#1C2030',
    roughness: 0.8,
    metalness: 0.2,
  }), [hovered]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Pulse scale for warning/critical
    if (groupRef.current && isPulsing) {
      const s = 1 + Math.sin(t * (status === 'CRITICAL' ? 5 : 3)) * 0.04;
      groupRef.current.scale.setScalar(s);
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1);
    }

    // Animate emissive light intensity
    if (lightRef.current && isPulsing) {
      lightRef.current.intensity = 0.5 + Math.sin(t * 3) * 0.3;
    }
  });

  return (
    <group
      position={position}
      onClick={e => { e.stopPropagation(); onSelect(); }}
      onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      <group ref={groupRef}>
        {/* Base platform */}
        <mesh position={[0, 0.15, 0]} material={baseMat}>
          <boxGeometry args={[4.2, 0.3, 4.2]} />
          {isSelected && <Outlines thickness={0.08} color="#3B82F6" />}
        </mesh>

        {/* Main body */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[3.8, 2, 3.8]} />
          <primitive object={bodyMat} attach="material" />
        </mesh>

        {/* Indicator panel on top (coloured block = status indicator) */}
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[2, 0.25, 2]} />
          <meshStandardMaterial
            color={emissive !== '#000000' ? emissive : '#2A3048'}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity * 1.5}
            roughness={0.4}
            metalness={0.5}
          />
        </mesh>

        {/* Small equipment details */}
        <mesh position={[1.6, 1.0, 0]}>
          <boxGeometry args={[0.4, 1.2, 0.8]} />
          <meshStandardMaterial color="#1A1F2E" roughness={0.9} metalness={0.1} />
        </mesh>
        <mesh position={[-1.6, 1.0, 0]}>
          <boxGeometry args={[0.4, 1.2, 0.8]} />
          <meshStandardMaterial color="#1A1F2E" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Selection highlight */}
        {isSelected && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.2, 2.6, 32]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        )}

        {/* Emissive point light for glowing stations */}
        {(isPulsing || isActive) && (
          <pointLight
            ref={isPulsing ? lightRef : undefined}
            position={[0, 3, 0]}
            color={emissive}
            intensity={isPulsing ? 0.7 : 0.2}
            distance={8}
            decay={2}
          />
        )}
      </group>

      {/* Risk ring on floor */}
      {riskLevel > 0.5 && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.2, 48]} />
          <meshBasicMaterial
            color="#C8902A"
            transparent
            opacity={0.3 + riskLevel * 0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Station label — always faces camera */}
      <Billboard position={[0, 3.5, 0]}>
        <Text
          fontSize={0.55}
          color={isSelected ? '#3B82F6' : hovered ? '#E8ECF4' : '#8B93AB'}
          anchorX="center"
          anchorY="bottom"
          font="/fonts/JetBrainsMono-Regular.ttf"
        >
          {externalId}
        </Text>
      </Billboard>
    </group>
  );
}
