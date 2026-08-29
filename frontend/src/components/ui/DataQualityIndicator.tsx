import React from 'react';

interface SignalState {
  name: string;
  state: 'MEASURED' | 'INFERRED' | 'MANUAL' | 'UNKNOWN';
}

interface DataQualityIndicatorProps {
  coveragePercent: number;
  signals: SignalState[];
  caveat?: string;
}

export const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({
  coveragePercent,
  signals,
  caveat
}) => {
  const getStateColor = (state: SignalState['state']) => {
    switch (state) {
      case 'MEASURED': return 'bg-[#2A9D4E]';
      case 'INFERRED': return 'bg-[#C8902A]';
      case 'MANUAL': return 'bg-[#3B82F6]';
      case 'UNKNOWN': default: return 'bg-[#4A5270]';
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#141720] border border-[#2A3048] rounded-md font-['Inter']">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#E8ECF4]">Data Coverage</span>
        <span className="text-sm font-['JetBrains_Mono'] text-[#E8ECF4]">{coveragePercent}%</span>
      </div>
      
      <div className="w-full h-1.5 bg-[#0D0F12] rounded-full overflow-hidden flex">
        <div className="h-full bg-[#2A9D4E]" style={{ width: `${coveragePercent}%` }} />
        <div className="h-full bg-[#4A5270]/30" style={{ width: `${100 - coveragePercent}%` }} />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <span className="text-xs text-[#8B93AB] uppercase tracking-wider">Signal Sources</span>
        <div className="flex flex-col gap-1.5">
          {signals.map((sig, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-[#E8ECF4]">{sig.name}</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${getStateColor(sig.state)}`} />
                <span className="text-[#8B93AB]">{sig.state}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {caveat && (
        <div className="mt-2 p-2 bg-[#C8902A]/10 border border-[#C8902A]/20 rounded text-xs text-[#C8902A]">
          {caveat}
        </div>
      )}
    </div>
  );
};
