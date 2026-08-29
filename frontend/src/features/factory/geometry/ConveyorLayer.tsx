import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { FACTORY_CONFIG } from '../../../lib/factory-config';
import * as THREE from 'three';

export default function ConveyorLayer() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < FACTORY_CONFIG.stations.length - 1; i++) {
      const p1 = FACTORY_CONFIG.stations[i].position;
      const p2 = FACTORY_CONFIG.stations[i + 1].position;
      pts.push(new THREE.Vector3(p1[0], 0.2, p1[2]));
      pts.push(new THREE.Vector3(p2[0], 0.2, p2[2]));
    }
    return pts;
  }, []);

  return (
    <group>
      {points.map((pt, i) => {
        if (i % 2 !== 0) return null;
        return (
          <Line
            key={i}
            points={[points[i], points[i+1]]}
            color="#2A3048"
            lineWidth={3}
            dashed={true}
            dashSize={2}
            gapSize={1}
          />
        );
      })}
    </group>
  );
}
