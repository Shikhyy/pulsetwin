import React from 'react';
import { useTwinStore } from '../../stores/twinStore';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface Props {
  stationId?: string;
}

export default function EventTimeline({ stationId }: Props) {
  const alerts = useTwinStore(s => s.activeAlerts);

  const relevant = stationId
    ? alerts.filter(a => a.stationId === stationId)
    : alerts;

  const displayed = relevant.slice(0, 5);

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-surface-2 rounded border border-border mt-4">
        <div className="label-sm mb-1">Recent Events</div>
        <p className="text-xs text-text-muted">No events recorded for this station.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-3 bg-surface-2 rounded border border-border mt-4">
      <div className="label-sm mb-2">Recent Events</div>
      <div className="flex flex-col gap-3">
        {displayed.map((ev, i) => {
          const Icon = ev.severity === 'CRITICAL'
            ? AlertTriangle
            : ev.severity === 'WARNING'
              ? AlertTriangle
              : CheckCircle;
          const color = ev.severity === 'CRITICAL'
            ? 'text-state-critical'
            : ev.severity === 'WARNING'
              ? 'text-state-attention'
              : 'text-state-normal';

          return (
            <div key={ev.id} className="flex gap-2.5 relative">
              <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${color}`} />
              {i !== displayed.length - 1 && (
                <div className="absolute top-4 left-1.5 -translate-x-1/2 w-px h-full bg-border" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-text-primary leading-snug">{ev.message}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`label-xs ${color}`}>{ev.severity}</span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
