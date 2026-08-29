import React from 'react';
import { Text } from '@react-three/drei';

export default function FactoryGeometry() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[200, 80]} />
        <meshStandardMaterial color="#12151C" roughness={0.9} />
      </mesh>
      
      {/* Zone A Boundary */}
      <mesh position={[-50, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 70]} />
        <meshBasicMaterial color="#1A3D2A" opacity={0.05} transparent depthWrite={false} />
      </mesh>
      <Text position={[-50, 0.1, -30]} rotation={[-Math.PI / 2, 0, 0]} fontSize={4} color="#4A5270" anchorX="center" anchorY="middle">ZONE A - BODY CONSTRUCTION</Text>

      {/* Zone B Boundary */}
      <mesh position={[10, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 70]} />
        <meshBasicMaterial color="#3D2A0A" opacity={0.05} transparent depthWrite={false} />
      </mesh>
      <Text position={[10, 0.1, -30]} rotation={[-Math.PI / 2, 0, 0]} fontSize={4} color="#4A5270" anchorX="center" anchorY="middle">ZONE B - PAINT</Text>

      {/* Zone C Boundary */}
      <mesh position={[60, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 70]} />
        <meshBasicMaterial color="#0A2A3D" opacity={0.05} transparent depthWrite={false} />
      </mesh>
      <Text position={[60, 0.1, -30]} rotation={[-Math.PI / 2, 0, 0]} fontSize={4} color="#4A5270" anchorX="center" anchorY="middle">ZONE C - FINAL ASSEMBLY</Text>

      {/* Pillars */}
      {[-90, -10, 30, 90].map(x => (
        [-35, 35].map(z => (
          <mesh key={`${x}-${z}`} position={[x, 5, z]}>
            <boxGeometry args={[1, 10, 1]} />
            <meshStandardMaterial color="#2A3048" />
          </mesh>
        ))
      ))}
    </group>
  );
}
