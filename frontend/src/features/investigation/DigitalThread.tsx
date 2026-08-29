import React from 'react';
import { useProductionUnit } from '../../hooks/useProductionUnit';

export const DigitalThread: React.FC<{ unitId: string }> = ({ unitId }) => {
  const { journey, isLoading, error } = useProductionUnit(unitId);

  if (isLoading) return <div className="text-[#8B93AB] p-4 font-['Inter']">Loading journey...</div>;
  if (error) return <div className="text-[#B83030] p-4 font-['Inter']">Error loading journey</div>;

  return (
    <div className="flex flex-col gap-4 font-['Inter'] text-[#E8ECF4] bg-[#0D0F12] p-4">
      <h3 className="text-sm font-semibold text-[#8B93AB] uppercase tracking-wider mb-2">Vehicle Journey</h3>
      
      <div className="relative border-l border-[#2A3048] ml-3 pl-6 flex flex-col gap-6">
        {journey.map((step: any, idx: number) => {
          const isAnomaly = step.status === 'warning' || step.status === 'fail';
          
          return (
            <div key={idx} className="relative">
              <div 
                className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-[#0D0F12] ${
                  step.status === 'pass' ? 'bg-[#2A9D4E]' : 
                  step.status === 'warning' ? 'bg-[#C8902A]' : 'bg-[#B83030]'
                }`} 
              />
              {isAnomaly && (
                <div className="absolute -left-[24px] top-0 bottom-[-24px] w-0.5 bg-[#C8902A] opacity-50" />
              )}
              
              <div className="bg-[#141720] border border-[#2A3048] rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{step.name}</span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#8B93AB]">{step.duration}</span>
                </div>
                {step.observations && step.observations.length > 0 && (
                  <ul className="text-xs text-[#8B93AB] list-disc pl-4 flex flex-col gap-1">
                    {step.observations.map((obs: string, oIdx: number) => (
                      <li key={oIdx}>{obs}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
