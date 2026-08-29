import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

export const AlertFeed: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', title: 'Torque Anomaly', message: 'Station 2 torque variance exceeds 3 sigma.', severity: 'critical', timestamp: '2m ago' },
    { id: '2', title: 'Capacity Warning', message: 'Station 5 approaching max utilization.', severity: 'warning', timestamp: '15m ago' },
  ]);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 w-80 z-50 font-['Inter']">
      {alerts.map(alert => (
        <div 
          key={alert.id}
          className={`flex items-start gap-3 p-3 rounded shadow-lg border ${
            alert.severity === 'critical' ? 'bg-[#141720] border-[#B83030]/50' :
            alert.severity === 'warning' ? 'bg-[#141720] border-[#C8902A]/50' :
            'bg-[#141720] border-[#3B82F6]/50'
          } animate-slide-in`}
        >
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            alert.severity === 'critical' ? 'text-[#B83030]' :
            alert.severity === 'warning' ? 'text-[#C8902A]' :
            'text-[#3B82F6]'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#E8ECF4] truncate">{alert.title}</h4>
              <span className="text-[10px] text-[#8B93AB] whitespace-nowrap ml-2">{alert.timestamp}</span>
            </div>
            <p className="text-xs text-[#8B93AB] mt-1 leading-snug">{alert.message}</p>
          </div>
          <button 
            onClick={() => dismissAlert(alert.id)}
            className="text-[#8B93AB] hover:text-[#E8ECF4] transition-colors ml-1 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
