import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const PlanningView: React.FC = () => {

  // Mock data for 7-day bottleneck heatmap (7 days x 24 hours just as an example instead of 40)
  const heatmapData = Array.from({ length: 7 }, (_, day) => 
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      value: Math.random() > 0.8 ? 'bottleneck' : Math.random() > 0.5 ? 'warning' : 'normal'
    }))
  );

  const getHeatmapColor = (value: string) => {
    switch (value) {
      case 'bottleneck': return 'bg-[#B83030]';
      case 'warning': return 'bg-[#C8902A]';
      default: return 'bg-[#2A9D4E]';
    }
  };

  const capacityData = [
    { name: 'Station 1', utilized: 85, available: 15 },
    { name: 'Station 2', utilized: 95, available: 5 },
    { name: 'Station 3', utilized: 60, available: 40 },
  ];

  return (
    <div className="flex flex-col gap-5 p-4 font-sans bg-root text-text-primary h-full overflow-y-auto">
      <h2 className="text-sm font-semibold text-text-primary">Planning View</h2>
      
      <div className="flex flex-col gap-4">
        <div className="bg-[#141720] border border-[#2A3048] p-4 rounded-md">
          <h3 className="text-sm font-semibold text-[#8B93AB] uppercase mb-4">7-Day Bottleneck Forecast</h3>
          <div className="flex flex-col gap-1">
            {heatmapData.map((day, dIdx) => (
              <div key={dIdx} className="flex gap-1 h-6">
                <span className="text-xs text-[#8B93AB] w-12 pt-1">Day {dIdx + 1}</span>
                {day.map((hour, hIdx) => (
                  <div 
                    key={hIdx} 
                    className={`flex-1 rounded-sm ${getHeatmapColor(hour.value)} opacity-80 hover:opacity-100 transition-opacity`}
                    title={`Hour ${hIdx}: ${hour.value}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#141720] border border-[#2A3048] p-4 rounded-md">
          <h3 className="text-sm font-semibold text-[#8B93AB] uppercase mb-4">Recurring Constraints</h3>
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-[#1C2030] border-l-2 border-[#B83030] rounded-r text-sm">
              <span className="font-semibold block mb-1">Station 2 (Assembly)</span>
              <span className="text-[#8B93AB]">Consistently exceeds 90% utilization during morning shifts.</span>
            </div>
            <div className="p-3 bg-[#1C2030] border-l-2 border-[#C8902A] rounded-r text-sm">
              <span className="font-semibold block mb-1">Station 5 (Testing)</span>
              <span className="text-[#8B93AB]">High variance in cycle time causing downstream starvation.</span>
            </div>
          </div>
        </div>

        <div className="bg-[#141720] border border-[#2A3048] p-4 rounded-md">
          <h3 className="text-sm font-semibold text-[#8B93AB] uppercase mb-4">Capacity Utilization</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#8B93AB" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{fill: '#1C2030'}}
                  contentStyle={{ backgroundColor: '#0D0F12', borderColor: '#2A3048', color: '#E8ECF4' }}
                />
                <Bar dataKey="utilized" stackId="a" fill="#3B82F6" />
                <Bar dataKey="available" stackId="a" fill="#2A3048" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
