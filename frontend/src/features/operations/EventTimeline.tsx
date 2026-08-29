import React from 'react';

export default function EventTimeline() {
  const events = [
    { type: 'WARNING', msg: 'Vibration threshold exceeded', time: '14:20:05' },
    { type: 'INFO', msg: 'Maintenance cycle completed', time: '12:00:00' },
    { type: 'CRITICAL', msg: 'Motor fault detected', time: '09:15:30' }
  ];

  return (
    <div className="flex flex-col gap-2 p-3 bg-surface-2 rounded border border-border mt-4">
      <div className="text-sm font-semibold mb-2">Recent Events</div>
      <div className="flex flex-col gap-3">
        {events.map((ev, i) => (
          <div key={i} className="flex gap-3 relative">
            <div className={`w-2 h-2 mt-1 rounded-full ${ev.type === 'WARNING' ? 'bg-[#C8902A]' : ev.type === 'CRITICAL' ? 'bg-[#B83030]' : 'bg-[#2A9D4E]'}`} />
            {i !== events.length - 1 && <div className="absolute top-3 left-1 w-px h-full bg-border" />}
            <div className="flex flex-col">
              <span className="text-xs text-text-primary">{ev.msg}</span>
              <span className="text-[10px] text-text-muted">{ev.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
