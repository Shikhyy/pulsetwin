import React from 'react';
import { useTwinStore } from '../../../stores/twinStore';
import ProductionUnitMesh from './ProductionUnitMesh';

export default function ProductionUnitLayer() {
  const { productionUnits, selectedUnitId, selectUnit } = useTwinStore();

  return (
    <group>
      {Object.values(productionUnits).map(unit => (
        <ProductionUnitMesh
          key={unit.id}
          unitId={unit.id}
          currentStationId={unit.currentStation}
          qualityRisk={0} // Mock risk
          isSelected={selectedUnitId === unit.id}
          onSelect={() => selectUnit(unit.id)}
        />
      ))}
    </group>
  );
}
