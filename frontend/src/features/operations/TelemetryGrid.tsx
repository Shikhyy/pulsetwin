import React from 'react';

export default function TelemetryGrid() {
  const mockData = [
    { label: 'Cycle Time', value: '45.2s', trend: '↑' },
    { label: 'Utilization', value: '88%', trend: '→' },
    { label: 'Queue', value: '2', trend: '↓' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {mockData.map((d, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-xs text-text-muted">{d.label}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-medium text-text-primary">{d.value}</span>
            <span className="text-xs text-text-secondary">{d.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
