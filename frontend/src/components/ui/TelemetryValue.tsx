import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

type StateClass = 'MEASURED' | 'INFERRED' | 'PREDICTED' | 'SIMULATED' | 'UNKNOWN';

interface TelemetryValueProps {
  label: string;
  value: number | string;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  stateClass: StateClass;
  freshness: string;
}

export const TelemetryValue: React.FC<TelemetryValueProps> = ({
  label,
  value,
  unit,
  trend = 'stable',
  stateClass,
  freshness
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-3 h-3 text-[#B83030]" />;
      case 'down': return <ArrowDownRight className="w-3 h-3 text-[#2A9D4E]" />;
      case 'stable': return <ArrowRight className="w-3 h-3 text-[#8B93AB]" />;
    }
  };

  const getStateClassStyles = (state: StateClass) => {
    switch (state) {
      case 'MEASURED': return 'text-[#2A9D4E] border-[#2A9D4E]/30 bg-[#2A9D4E]/10';
      case 'INFERRED': return 'text-[#C8902A] border-[#C8902A]/30 bg-[#C8902A]/10';
      case 'PREDICTED': return 'text-[#2A6EC8] border-[#2A6EC8]/30 bg-[#2A6EC8]/10';
      case 'SIMULATED': return 'text-[#7B2AC8] border-[#7B2AC8]/30 bg-[#7B2AC8]/10';
      case 'UNKNOWN': default: return 'text-[#4A5270] border-[#4A5270]/30 bg-[#4A5270]/10';
    }
  };

  return (
    <div className="flex flex-col bg-[#141720] border border-[#2A3048] p-3 rounded-md font-['Inter']">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#8B93AB] uppercase tracking-wider">{label}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStateClassStyles(stateClass)}`}>
          {stateClass}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-xl font-['JetBrains_Mono'] text-[#E8ECF4] leading-none">
          {value}
        </span>
        <span className="text-sm text-[#8B93AB] leading-none mb-0.5">{unit}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {getTrendIcon()}
          <span className="text-[10px] text-[#8B93AB]">{freshness}</span>
        </div>
      </div>
    </div>
  );
};
