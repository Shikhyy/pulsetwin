import React from 'react';
import Badge from '../../components/ui/Badge';

export default function EvidencePanel() {
  const mockEvidence = [
    { name: 'Vibration Anomaly', direction: '+', strength: 0.8, isMeasured: true },
    { name: 'Cycle Time Drift', direction: '+', strength: 0.6, isMeasured: true },
    { name: 'Buffer Capacity', direction: '-', strength: 0.4, isMeasured: false }
  ];

  return (
    <div className="flex flex-col gap-2 p-3 bg-surface-2 rounded border border-border mt-4">
      <div className="text-sm font-semibold mb-2">Evidence</div>
      {mockEvidence.map((ev, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-primary flex items-center gap-1">
              <span className={ev.direction === '+' ? 'text-[#C8902A]' : 'text-[#2A9D4E]'}>{ev.direction}</span>
              {ev.name}
            </span>
            <Badge classType={ev.isMeasured ? 'MEASURED' : 'INFERRED'} />
          </div>
          <div className="h-1 bg-surface-3 rounded w-full overflow-hidden">
            <div className={`h-full ${ev.direction === '+' ? 'bg-[#C8902A]' : 'bg-[#2A9D4E]'}`} style={{ width: `${ev.strength * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
