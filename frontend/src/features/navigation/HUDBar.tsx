import React, { useEffect, useState } from 'react';
import { useTwinStore } from '../../stores/twinStore';
import { useUiStore } from '../../stores/uiStore';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const MODE_LABELS: Record<string, string> = {
  operations: 'Operations',
  investigation: 'Investigation',
  simulation: 'Simulation',
  planning: 'Planning',
  leadership: 'Leadership',
};

function LiveClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-GB', { hour12: false }));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[11px] text-text-muted tabular-nums">{time}</span>
  );
}

export default function HUDBar() {
  const isConnected = useTwinStore(s => s.isConnected);
  const activeAlerts = useTwinStore(s => s.activeAlerts.filter(a => !a.dismissed));
  const mode = useUiStore(s => s.mode);

  const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'WARNING').length;

  return (
    <div className="h-8 border-b border-border bg-surface shrink-0 flex items-center px-4 gap-4 text-[11px] z-10">
      {/* Plant name */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="label-xs">MERIDIAN ASSEMBLY · LINE 1</div>
      </div>

      <div className="h-3 w-px bg-border" />

      {/* Mode indicator */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-text-muted">Mode</span>
        <span className="text-accent font-semibold">{MODE_LABELS[mode]}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-state-critical" />
              <span className="text-state-critical font-semibold tabular-nums">{criticalCount}</span>
              <span className="text-text-muted">critical</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-state-attention" />
              <span className="text-state-attention font-semibold tabular-nums">{warningCount}</span>
              <span className="text-text-muted">warning</span>
            </div>
          )}
        </div>
      )}

      <div className="h-3 w-px bg-border" />

      {/* Live clock */}
      <div className="flex items-center gap-1.5 shrink-0">
        <LiveClock />
      </div>

      <div className="h-3 w-px bg-border" />

      {/* Connection status */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 text-state-normal" />
            <span className="text-state-normal font-mono">LIVE</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-state-critical animate-status-blink" />
            <span className="text-state-critical font-mono">OFFLINE</span>
          </>
        )}
      </div>
    </div>
  );
}
