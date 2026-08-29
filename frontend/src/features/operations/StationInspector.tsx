import React from 'react';
import { FACTORY_CONFIG } from '../../lib/factory-config';
import { useTwinStore } from '../../stores/twinStore';
import StatusIndicator from '../../components/ui/StatusIndicator';
import { StationStatus } from '../factory/geometry/StationMesh';
import PredictionPanel from './PredictionPanel';
import Badge from '../../components/ui/Badge';
import TelemetryGrid from './TelemetryGrid';

export default function StationInspector({ stationId }: { stationId: string }) {
  const station = FACTORY_CONFIG.stations.find((s) => s.id === stationId);
  const state = useTwinStore((s) => s.stations[stationId]) || { status: 'RUNNING', riskLevel: 0 };
  
  if (!station) return null;

  return (
    <div className="flex flex-col h-full bg-surface text-text-primary p-4 gap-4 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold font-mono text-text-primary">{station.id} · {station.name}</h2>
        <StatusIndicator status={state.status as StationStatus} />
        <div className="h-1 bg-border rounded mt-2 overflow-hidden">
          <div className="h-full bg-accent" style={{ width: '85%' }} />
        </div>
        <div className="text-xs text-text-muted mt-1">Instrumentation Coverage: 85%</div>
      </div>
      
      <div className="flex flex-col gap-2 p-3 bg-surface-2 rounded border border-border">
        <div className="text-sm font-semibold mb-2 flex items-center justify-between">
          Current State <Badge classType="MEASURED" />
        </div>
        <TelemetryGrid />
      </div>

      <PredictionPanel stationId={stationId} />
    </div>
  );
}
