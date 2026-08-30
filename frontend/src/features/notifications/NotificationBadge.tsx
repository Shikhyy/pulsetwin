import React from 'react';
import { Bell } from 'lucide-react';
import { useTwinStore } from '../../stores/twinStore';

export default function NotificationBadge() {
  const alerts = useTwinStore(s => s.activeAlerts.filter(a => !a.dismissed));
  const critCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const count = alerts.length;

  return (
    <div className="absolute top-3 right-3 z-20">
      <button
        className="relative p-2 bg-surface border border-border rounded hover:bg-surface-2 transition-colors group"
        aria-label={`Notifications${count > 0 ? ` — ${count} active` : ''}`}
        title="Alerts"
      >
        <Bell className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
        {count > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full border border-surface text-[9px] font-bold font-mono px-1 ${
              critCount > 0
                ? 'bg-state-critical text-white'
                : 'bg-state-attention text-white'
            }`}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
    </div>
  );
}
