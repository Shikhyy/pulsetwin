import React from 'react';
import { X } from 'lucide-react';
import { useTwinStore } from '../../stores/twinStore';
import { useUiStore } from '../../stores/uiStore';
import StationInspector from './StationInspector';
import { DigitalThread } from '../investigation/DigitalThread';

// Lazy imports for heavy panels
const SimulationPanel = React.lazy(() => import('../simulation/SimulationPanel').then(m => ({ default: m.SimulationPanel })));
const PlanningView = React.lazy(() => import('../planning/PlanningView').then(m => ({ default: m.PlanningView })));
const LeadershipView = React.lazy(() => import('../leadership/LeadershipView').then(m => ({ default: m.LeadershipView })));

export function ContextPanel() {
  const selectedStationId = useTwinStore(s => s.selectedStationId);
  const selectedUnitId = useTwinStore(s => s.selectedUnitId);
  const mode = useUiStore(s => s.mode);
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
  };

  const getPanelTitle = () => {
    if (mode === 'simulation') return 'Simulation';
    if (mode === 'planning') return 'Planning';
    if (mode === 'leadership') return 'Leadership';
    if (selectedUnitId) return 'Vehicle Thread';
    if (selectedStationId) return 'Station';
    return 'Context';
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
      className="fixed top-0 right-0 h-screen w-[340px] bg-[#141720] border-l border-[#2A3048] z-50 flex flex-col shadow-2xl"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A3048] bg-[#0D0F12] shrink-0">
        <span className="text-[11px] font-semibold text-[#8B93AB] uppercase tracking-widest">
          {getPanelTitle()}
        </span>
        <button
          onClick={handleClose}
          className="text-[#4A5270] hover:text-[#E8ECF4] transition-colors p-1 rounded"
          aria-label="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2A3048 transparent' }}>
        {renderContent()}
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-12 rounded bg-[#1C2030]" />
      ))}
    </div>
  );
}

export default ContextPanel;
