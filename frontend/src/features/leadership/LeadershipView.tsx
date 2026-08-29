import React from 'react';
import { ArrowUpRight, ShieldCheck, DollarSign, Activity } from 'lucide-react';

export const LeadershipView: React.FC = () => {
  const kpis = [
    { title: 'Overall Equipment Effectiveness', value: '78.4%', trend: '+2.1%', icon: <Activity className="w-5 h-5 text-[#3B82F6]" /> },
    { title: 'First Pass Yield', value: '94.2%', trend: '-0.5%', icon: <ShieldCheck className="w-5 h-5 text-[#2A9D4E]" /> },
    { title: 'Prevented Defects (MTD)', value: '142', trend: '+15', icon: <Activity className="w-5 h-5 text-[#C8902A]" /> },
    { title: 'Estimated Savings (MTD)', value: '$24.5k', trend: '+$4.2k', icon: <DollarSign className="w-5 h-5 text-[#2A6EC8]" /> },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 font-['Inter'] bg-[#0D0F12] text-[#E8ECF4] h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Leadership Overview</h2>
        <button className="text-xs bg-[#2A3048] hover:bg-[#1C2030] px-3 py-1.5 rounded transition-colors text-[#E8ECF4]">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-[#141720] border border-[#2A3048] p-4 rounded-md flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B93AB] font-semibold uppercase tracking-wider">{kpi.title}</span>
              {kpi.icon}
            </div>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-['JetBrains_Mono']">{kpi.value}</span>
              <div className="flex items-center gap-1 mb-1">
                <ArrowUpRight className={`w-3 h-3 ${kpi.trend.startsWith('+') ? 'text-[#2A9D4E]' : 'text-[#B83030]'}`} />
                <span className={`text-xs font-['JetBrains_Mono'] ${kpi.trend.startsWith('+') ? 'text-[#2A9D4E]' : 'text-[#B83030]'}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#141720] border border-[#2A3048] p-5 rounded-md flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between border-b border-[#2A3048] pb-3">
          <h3 className="text-sm font-semibold text-[#E8ECF4] tracking-wide">TOP OPTIMIZATION OPPORTUNITY</h3>
          <span className="text-[10px] bg-[#2A9D4E]/10 text-[#2A9D4E] border border-[#2A9D4E]/30 px-2 py-0.5 rounded">
            HIGH CONFIDENCE (88%)
          </span>
        </div>
        
        <p className="text-sm text-[#8B93AB] leading-relaxed">
          Historical data and recent simulations indicate that reducing the cycle time on <span className="text-[#E8ECF4] font-medium">Station 2 (Assembly)</span> by 5% and adjusting torque parameters could yield an estimated 12% reduction in downstream dimensional defects, clearing the primary bottleneck for Line A.
        </p>
        
        <div className="mt-2">
          <button className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">
            Open in Investigation Mode &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
