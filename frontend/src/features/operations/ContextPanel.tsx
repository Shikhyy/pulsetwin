import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useTwinStore } from '../../stores/twinStore';
import { useUiStore } from '../../stores/uiStore';
import StationInspector from './StationInspector';
import { DigitalThread } from '../investigation/DigitalThread';
import { FACTORY_CONFIG } from '../../lib/factory-config';

// Lazy imports for heavy panels
const SimulationPanel = React.lazy(() =>
  import('../simulation/SimulationPanel').then(m => ({ default: m.SimulationPanel }))
);
const PlanningView = React.lazy(() =>
  import('../planning/PlanningView').then(m => ({ default: m.PlanningView }))
);
const LeadershipView = React.lazy(() =>
  import('../leadership/LeadershipView').then(m => ({ default: m.LeadershipView }))
);

const MODE_LABELS: Record<string, string> = {
  simulation: 'Simulation Sandbox',
  planning: 'Planning',
  leadership: 'Leadership Overview',
};

export function ContextPanel() {
  const selectedStationId = useTwinStore(s => s.selectedStationId);
  const selectedUnitId = useTwinStore(s => s.selectedUnitId);
  const mode = useUiStore(s => s.mode);
  const setMode = useUiStore(s => s.setMode);
  const selectStation = useTwinStore(s => s.selectStation);
  const selectUnit = useTwinStore(s => s.selectUnit);

  const isOpen =
    selectedStationId !== null ||
    selectedUnitId !== null ||
    mode === 'simulation' ||
    mode === 'planning' ||
    mode === 'leadership';

  const handleClose = () => {
    selectStation(null);
    selectUnit(null);
    if (mode === 'simulation' || mode === 'planning' || mode === 'leadership') {
      setMode('operations');
    }
  };

  const getPanelTitle = () => {
    if (mode === 'simulation') return MODE_LABELS.simulation;
    if (mode === 'planning') return MODE_LABELS.planning;
    if (mode === 'leadership') return MODE_LABELS.leadership;
    if (selectedUnitId) return 'Vehicle Thread';
    if (selectedStationId) {
      const st = FACTORY_CONFIG.stations.find(s => s.id === selectedStationId);
      return st ? st.id : 'Station';
    }
    return 'Context';
  };

  const getBreadcrumb = () => {
    if (selectedStationId) {
      const st = FACTORY_CONFIG.stations.find(s => s.id === selectedStationId);
      if (!st) return null;
      return (
        <div className="flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
          <span>Line 1</span>
          <ChevronRight className="w-3 h-3" />
          <span>{st.zoneId === 'zone-a' ? 'Body Construction' : st.zoneId === 'zone-b' ? 'Paint' : 'Final Assembly'}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-secondary">{st.name}</span>
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (mode === 'simulation') {
      return (
        <React.Suspense fallback={<PanelSkeleton />}>
          <SimulationPanel />
        </React.Suspense>
      );
    }
    if (mode === 'planning') {
      return (
        <React.Suspense fallback={<PanelSkeleton />}>
          <PlanningView />
        </React.Suspense>
      );
    }
    if (mode === 'leadership') {
      return (
        <React.Suspense fallback={<PanelSkeleton />}>
          <LeadershipView />
        </React.Suspense>
      );
    }
    if (selectedUnitId) {
      return <DigitalThread unitId={selectedUnitId} />;
    }
    if (selectedStationId) {
      return <StationInspector stationId={selectedStationId} />;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 h-screen w-[360px] bg-surface border-l border-border z-50 flex flex-col shadow-2xl animate-slide-in-right"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-border bg-root shrink-0">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-text-primary">
            {getPanelTitle()}
          </span>
          {getBreadcrumb()}
        </div>
        <button
          onClick={handleClose}
          className="text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors p-1 rounded mt-0.5 shrink-0"
          aria-label="Close panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[72, 48, 48, 100, 64].map((h, i) => (
        <div key={i} className="rounded shimmer" style={{ height: h }} />
      ))}
    </div>
  );
}

export default ContextPanel;
