import React from 'react';
import { FACTORY_CONFIG } from '../../lib/factory-config';
import { useTwinStore } from '../../stores/twinStore';
import StatusIndicator from '../../components/ui/StatusIndicator';
import { StationStatus } from '../factory/geometry/StationMesh';
import PredictionPanel from './PredictionPanel';
import Badge from '../../components/ui/Badge';
import TelemetryGrid from './TelemetryGrid';
import EventTimeline from './EventTimeline';
import { ChevronRight, Radio, Clock, Layers } from 'lucide-react';

const INSTRUMENTATION_COVERAGE: Record<string, number> = {
  RICH: 95,
  PARTIAL: 68,
  MANUAL_ONLY: 35,
  SENSOR_POOR: 38,
};

const ZONE_LABELS: Record<string, string> = {
  'zone-a': 'Body Construction',
  'zone-b': 'Paint',
  'zone-c': 'Final Assembly',
};

const ZONE_COLORS: Record<string, string> = {
  'zone-a': 'text-state-normal',
  'zone-b': 'text-state-attention',
  'zone-c': 'text-state-predicted',
};

export default function StationInspector({ stationId }: { stationId: string }) {
  const station = FACTORY_CONFIG.stations.find(s => s.id === stationId);
  const state = useTwinStore(s => s.stations[stationId]) || { status: 'RUNNING', riskLevel: 0 };

  if (!station) return null;

  const coverage = INSTRUMENTATION_COVERAGE[station.instrumentationProfile] ?? 50;
  const downstream = station.downstreamId
    ? FACTORY_CONFIG.stations.find(s => s.id === station.downstreamId)
    : null;

  return (
    <div className="flex flex-col bg-surface text-text-primary overflow-y-auto">

      {/* Station header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-mono text-sm font-bold text-text-primary">{station.id}</h2>
            <p className="text-xs text-text-secondary mt-0.5">{station.name}</p>
          </div>
          <StatusIndicator status={state.status as StationStatus} />
        </div>

        {/* Zone breadcrumb */}
        <div className="flex items-center gap-1 mt-2">
          <Layers className="w-3 h-3 text-text-muted" />
          <span className="text-[10px] text-text-muted">Line 1</span>
          <ChevronRight className="w-3 h-3 text-text-muted" />
          <span className={`text-[10px] font-medium ${ZONE_COLORS[station.zoneId] ?? 'text-text-secondary'}`}>
            {ZONE_LABELS[station.zoneId] ?? station.zoneId}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">

        {/* Instrumentation coverage */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-text-muted" />
              <span className="label-xs">Instrumentation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-text-primary">{coverage}%</span>
              <span className="label-xs border border-border px-1.5 py-0.5 rounded">
                {station.instrumentationProfile.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="h-1 bg-surface-3 rounded overflow-hidden">
            <div
              className={`h-full rounded transition-all ${
                coverage >= 80 ? 'bg-state-normal' : coverage >= 50 ? 'bg-state-attention' : 'bg-state-critical'
              }`}
              style={{ width: `${coverage}%` }}
            />
          </div>
        </div>

        {/* Cycle time */}
        <div className="flex items-center justify-between py-2 border-y border-border">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-text-muted" />
            <span className="text-xs text-text-secondary">Cycle Time Target</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm font-bold text-text-primary">{station.cycleTimeTarget}</span>
            <span className="text-[10px] text-text-muted">s ±{station.cycleTimeStd}s</span>
          </div>
        </div>

        {/* Current state telemetry */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="label-sm">Current State</span>
            <Badge classType="MEASURED" />
          </div>
          <div className="bg-surface-2 border border-border rounded p-3">
            <TelemetryGrid stationId={stationId} />
          </div>
        </div>

        {/* Downstream */}
        {downstream && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Downstream</span>
            <div className="flex items-center gap-1 text-text-secondary">
              <span className="font-mono">{downstream.id}</span>
              <span className="text-text-muted">·</span>
              <span>{downstream.name}</span>
            </div>
          </div>
        )}

        {/* Buffer indicator */}
        {station.isBuffer && (
          <div className="px-2 py-1.5 rounded bg-surface-2 border border-border text-[10px] text-text-muted">
            This is a <strong className="text-text-secondary">buffer station</strong> with capacity {station.bufferCapacity}.
          </div>
        )}

        {/* Prediction */}
        <PredictionPanel stationId={stationId} />

        {/* Timeline */}
        <EventTimeline stationId={stationId} />
      </div>
    </div>
  );
}
