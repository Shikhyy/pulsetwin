import React from 'react';

type CoverageLevel = 'RICH' | 'PARTIAL' | 'MANUAL_ONLY' | 'SENSOR_POOR';

interface InstrumentationBadgeProps {
  level: CoverageLevel;
  coveragePercent?: number;
}

export const InstrumentationBadge: React.FC<InstrumentationBadgeProps> = ({
  level,
  coveragePercent
}) => {
  const getLevelStyles = () => {
    switch (level) {
      case 'RICH': return 'text-[#2A9D4E] bg-[#2A9D4E]/10 border-[#2A9D4E]/30';
      case 'PARTIAL': return 'text-[#C8902A] bg-[#C8902A]/10 border-[#C8902A]/30';
      case 'MANUAL_ONLY': return 'text-[#B83030] bg-[#B83030]/10 border-[#B83030]/30';
      case 'SENSOR_POOR': return 'text-[#8B93AB] bg-[#8B93AB]/10 border-[#8B93AB]/30';
      default: return 'text-[#8B93AB] bg-[#8B93AB]/10 border-[#8B93AB]/30';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-['Inter'] ${getLevelStyles()}`}>
      <span className="font-semibold tracking-wide">{level.replace('_', ' ')}</span>
      {coveragePercent !== undefined && (
        <span className="font-['JetBrains_Mono'] opacity-80">
          ({coveragePercent}%)
        </span>
      )}
    </div>
  );
};
