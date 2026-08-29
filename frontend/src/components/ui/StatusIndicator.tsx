import React from 'react';
import { StationStatus } from '../../features/factory/geometry/StationMesh';

export default function StatusIndicator({ status }: { status: StationStatus }) {
  const colors = {
    RUNNING: '#2A9D4E', IDLE: '#4A5270', BLOCKED: '#C85A2A', STARVED: '#C8902A',
    DEGRADED: '#C8902A', MAINTENANCE: '#2A6EC8', WARNING: '#C8902A', CRITICAL: '#B83030', OFFLINE: '#4A5270'
  };
  const color = colors[status] || colors.OFFLINE;
  const isPulsing = status === 'WARNING' || status === 'CRITICAL';

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-2 w-2">
        {isPulsing && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }}></span>}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }}></span>
      </div>
      <span className="text-xs font-medium tracking-wide uppercase" style={{ color }}>{status}</span>
    </div>
  );
}
