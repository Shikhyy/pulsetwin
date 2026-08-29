import React from 'react';

interface RiskBarProps {
  value: number;
  label?: string;
}

export const RiskBar: React.FC<RiskBarProps> = ({ value, label }) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  let colorClass = 'bg-[#2A9D4E]';
  if (clampedValue >= 40 && clampedValue <= 70) {
    colorClass = 'bg-[#C8902A]';
  } else if (clampedValue > 70) {
    colorClass = 'bg-[#B83030]';
  }

  return (
    <div className="flex flex-col gap-1 w-full font-['Inter'] text-[#E8ECF4]">
      {label && <span className="text-xs text-[#8B93AB]">{label}</span>}
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1 h-2 bg-[#141720] rounded-sm overflow-hidden border border-[#2A3048]">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${colorClass}`} 
            style={{ width: `${clampedValue}%` }}
          />
          <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[#8B93AB] opacity-50" />
        </div>
        <span className="text-xs font-['JetBrains_Mono'] w-8 text-right">
          {clampedValue}%
        </span>
      </div>
    </div>
  );
};
