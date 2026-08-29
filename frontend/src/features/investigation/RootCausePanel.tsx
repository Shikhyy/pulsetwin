import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Contributor {
  id: string;
  name: string;
  type: 'MEASURED' | 'INFERRED';
  confidence: number;
  description: string;
}

export const RootCausePanel: React.FC = () => {
  const contributors: Contributor[] = [
    { id: '1', name: 'Station 2 Torque Variance', type: 'MEASURED', confidence: 85, description: 'High torque variance correlated with downstream dimensional failure.' },
    { id: '2', name: 'Material Batch Quality', type: 'INFERRED', confidence: 60, description: 'Possible raw material variation based on vendor history.' }
  ];

  return (
    <div className="flex flex-col gap-4 font-['Inter'] bg-[#141720] p-4 border border-[#2A3048] rounded">
      <h2 className="text-lg font-semibold text-[#E8ECF4]">Possible Contributors</h2>
      <p className="text-xs text-[#8B93AB] italic mb-2">
        Note: The following are hypotheses generated from correlational data and require manual verification.
      </p>

      <div className="bg-[#1C2030] p-3 rounded border border-[#2A3048] mb-4">
        <h4 className="text-xs font-semibold text-[#8B93AB] uppercase tracking-wider mb-2">Evidence Chain</h4>
        <div className="flex items-center gap-2 text-xs text-[#E8ECF4] flex-wrap">
          <span className="text-[#B83030] border border-[#B83030]/30 px-1.5 py-0.5 rounded">Quality Event</span>
          <span className="text-[#8B93AB]">&rarr;</span>
          <span className="bg-[#2A3048] px-1.5 py-0.5 rounded">Unit U-1024</span>
          <span className="text-[#8B93AB]">&rarr;</span>
          <span className="bg-[#2A3048] px-1.5 py-0.5 rounded">Assembly St.</span>
          <span className="text-[#8B93AB]">&rarr;</span>
          <span className="text-[#C8902A] border border-[#C8902A]/30 px-1.5 py-0.5 rounded">Torque Spike</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {contributors.map(c => (
          <div key={c.id} className="flex flex-col gap-2 p-3 bg-[#0D0F12] border border-[#2A3048] rounded">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#E8ECF4]">{c.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                c.type === 'MEASURED' ? 'text-[#2A9D4E] border-[#2A9D4E]/30 bg-[#2A9D4E]/10' : 
                'text-[#C8902A] border-[#C8902A]/30 bg-[#C8902A]/10'
              }`}>
                {c.type}
              </span>
            </div>
            <p className="text-sm text-[#8B93AB]">{c.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#8B93AB]">Confidence:</span>
              <div className="flex-1 h-1.5 bg-[#141720] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#3B82F6]" 
                  style={{ width: `${c.confidence}%` }} 
                />
              </div>
              <span className="text-xs font-['JetBrains_Mono'] text-[#E8ECF4]">{c.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
