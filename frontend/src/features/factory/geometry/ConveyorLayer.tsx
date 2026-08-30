import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { FACTORY_CONFIG, STATION_MAP } from '../../../lib/factory-config';
import * as THREE from 'three';

export default function ConveyorLayer() {
  // Build conveyor lines from downstream topology, not sequential order
  const segments = useMemo(() => {
    const segs: Array<[THREE.Vector3, THREE.Vector3]> = [];
    
    for (const station of FACTORY_CONFIG.stations) {
      if (!station.downstreamId) continue;
      const downstream = STATION_MAP.get(station.downstreamId);
      if (!downstream) continue;

      const from = new THREE.Vector3(station.position[0], 0.15, station.position[2]);
      const to = new THREE.Vector3(downstream.position[0], 0.15, downstream.position[2]);
      segs.push([from, to]);
    }

    return segs;
  }, []);

  return (
    <group>
      {segments.map(([from, to], i) => (
        <Line
          key={i}
          points={[from, to]}
          color="#2A3048"
          lineWidth={1.5}
          dashed
          dashSize={1.5}
          gapSize={1}
        />
      ))}
    </group>
  );
}
