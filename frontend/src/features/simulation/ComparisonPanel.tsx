import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ComparisonPanelProps {
  results: any;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="h-full flex items-center justify-center text-[#8B93AB] text-sm font-['Inter']">
        Run a simulation to view comparison results.
      </div>
    );
  }

  const chartData = [
    { name: 'ST-17', Baseline: 85, Simulated: 85 },
    { name: 'ST-18', Baseline: 98, Simulated: 87.4 }, // Bottleneck relieved
    { name: 'ST-19', Baseline: 60, Simulated: 75 },   // Starvation relieved
  ];

  return (
    <div className="flex flex-col gap-6 font-['Inter'] h-full">
      <div className="flex items-center justify-between border-b border-[#2A3048] pb-3">
        <h3 className="text-sm font-semibold text-[#E8ECF4] uppercase tracking-wider">Results</h3>
        <span className="text-[10px] bg-[#7B2AC8]/10 text-[#7B2AC8] border border-[#7B2AC8]/30 px-2 py-0.5 rounded tracking-widest font-semibold">
          SIMULATED
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold text-[#8B93AB] uppercase">Key Metrics Impact</h4>
        
        <div className="bg-[#141720] border border-[#2A3048] rounded flex flex-col divide-y divide-[#2A3048]">
          <div className="flex items-center justify-between p-3">
            <span className="text-sm text-[#E8ECF4]">Throughput (units/hr)</span>
            <div className="flex items-center gap-3 font-['JetBrains_Mono'] text-sm">
              <span className="text-[#8B93AB]">42.5</span>
              <span className="text-[#4A5270]">&rarr;</span>
              <span className="text-[#E8ECF4]">44.8</span>
              <span className="text-[10px] bg-[#2A9D4E]/10 text-[#2A9D4E] px-1.5 py-0.5 rounded">+5.4%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3">
            <span className="text-sm text-[#E8ECF4]">Defect Rate (%)</span>
            <div className="flex items-center gap-3 font-['JetBrains_Mono'] text-sm">
              <span className="text-[#8B93AB]">3.2</span>
              <span className="text-[#4A5270]">&rarr;</span>
              <span className="text-[#E8ECF4]">2.8</span>
              <span className="text-[10px] bg-[#2A9D4E]/10 text-[#2A9D4E] px-1.5 py-0.5 rounded">-12.5%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <h4 className="text-xs font-semibold text-[#8B93AB] uppercase">Station Utilization</h4>
        <div className="h-[200px] w-full bg-[#141720] border border-[#2A3048] rounded p-2 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#8B93AB" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B93AB" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                cursor={{fill: '#1C2030'}}
                contentStyle={{ backgroundColor: '#0D0F12', borderColor: '#2A3048', color: '#E8ECF4', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#8B93AB' }} />
              <Bar dataKey="Baseline" fill="#2A3048" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Simulated" fill="#7B2AC8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-[#8B93AB] uppercase">Affected Stations</span>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-[#1C2030] border border-[#2A3048] rounded text-[#E8ECF4]">ST-18 (E-Coat Oven)</span>
          <span className="text-xs px-2 py-1 bg-[#1C2030] border border-[#2A3048] rounded text-[#E8ECF4]">ST-19 (Paint Buffer)</span>
        </div>
      </div>

      <button className="mt-auto bg-[#2A3048] hover:bg-[#1C2030] text-[#E8ECF4] text-sm font-medium py-2.5 rounded transition-colors border border-[#4A5270]">
        Save as Recommendation
      </button>
    </div>
  );
};
