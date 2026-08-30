import React from 'react';
import { useTwinStore } from '../../../stores/twinStore';
import { useUiStore } from '../../../stores/uiStore';
import { FACTORY_CONFIG } from '../../../lib/factory-config';
import StationMesh from './StationMesh';
import { StationStatus } from './StationMesh';

export default function StationLayer() {
  const { stations, selectedStationId, selectStation } = useTwinStore();
  const equipmentVisible = useUiStore(s => s.layerVisibility.equipment);

  if (!equipmentVisible) return null;

  return (
    <group>
      {FACTORY_CONFIG.stations.map((st) => {
        const state = stations[st.id] || { status: 'RUNNING', riskLevel: 0 };
        return (
          <StationMesh
            key={st.id}
            stationId={st.id}
            externalId={st.id}
            name={st.name}
            position={st.position}
            status={state.status as StationStatus}
            riskLevel={state.riskLevel}
            isSelected={selectedStationId === st.id}
            onSelect={() => selectStation(st.id)}
          />
        );
      })}
    </group>
  );
}
