import React from 'react';

export const RecommendationPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 font-['Inter'] bg-[#141720] border border-[#2A3048] p-5 rounded-md w-full">
      <div className="flex items-center justify-between border-b border-[#2A3048] pb-3">
        <h3 className="text-sm font-semibold text-[#E8ECF4] tracking-wide">RECOMMENDED ACTION</h3>
        <span className="text-[10px] bg-[#2A6EC8]/10 text-[#2A6EC8] border border-[#2A6EC8]/30 px-2 py-0.5 rounded">
          PREDICTED
        </span>
      </div>

      <p className="text-sm text-[#E8ECF4] leading-relaxed">
        Adjust calibration parameter <span className="font-['JetBrains_Mono'] bg-[#2A3048] px-1 rounded">torque_offset</span> on Station 2 by -0.5Nm to prevent further dimensional variance downstream.
      </p>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-[#8B93AB] uppercase">Expected Impact</span>
        <ul className="text-sm text-[#E8ECF4] list-disc pl-4 flex flex-col gap-1">
          <li>Reduce defect rate by estimated 12%</li>
          <li>No significant impact on cycle time</li>
        </ul>
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8B93AB]">Recommendation Confidence</span>
          <span className="font-['JetBrains_Mono'] text-[#2A9D4E]">88%</span>
        </div>
        <div className="w-full h-1.5 bg-[#0D0F12] rounded-full overflow-hidden">
          <div className="h-full bg-[#2A9D4E]" style={{ width: '88%' }} />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <span className="text-xs font-semibold text-[#8B93AB] uppercase">Key Evidence</span>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#2A9D4E] bg-[#2A9D4E]/10 border border-[#2A9D4E]/30 px-1.5 py-0.5 rounded text-[10px]">MEASURED</span>
            <span className="text-[#E8ECF4]">Torque variance correlation with rejects</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#7B2AC8] bg-[#7B2AC8]/10 border border-[#7B2AC8]/30 px-1.5 py-0.5 rounded text-[10px]">SIMULATED</span>
            <span className="text-[#E8ECF4]">Offset adjustment restores Cpk &gt; 1.33</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-[#2A3048]">
        <button className="flex-1 bg-[#2A3048] hover:bg-[#1C2030] text-[#E8ECF4] text-sm py-2 rounded transition-colors">
          Acknowledge
        </button>
        <button className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-[#E8ECF4] text-sm py-2 rounded transition-colors">
          Simulate Intervention
        </button>
      </div>
    </div>
  );
};
