import React from 'react';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts';

interface Observation {
  timestamp: string;
  value: number;
  isAnomaly: boolean;
}

interface TelemetryChartProps {
  signalName: string;
  unit: string;
  observations: Observation[];
  ucl?: number;
  lcl?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  signalName,
  unit,
  observations,
  ucl,
  lcl
}) => {
  return (
    <div className="flex flex-col bg-[#141720] border border-[#2A3048] p-4 rounded-md font-['Inter'] w-full h-[250px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-[#E8ECF4]">{signalName}</span>
        <span className="text-xs text-[#8B93AB]">{unit}</span>
      </div>
      
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={observations} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="timestamp" 
              stroke="#8B93AB" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => val.split('T')[1]?.substring(0,5) || val}
            />
            <YAxis 
              stroke="#8B93AB" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0D0F12', borderColor: '#2A3048', color: '#E8ECF4' }}
              itemStyle={{ color: '#E8ECF4' }}
              labelStyle={{ color: '#8B93AB' }}
            />
            {ucl !== undefined && (
              <ReferenceLine y={ucl} stroke="#C8902A" strokeDasharray="3 3" />
            )}
            {lcl !== undefined && (
              <ReferenceLine y={lcl} stroke="#C8902A" strokeDasharray="3 3" />
            )}
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isAnomaly) {
                  return (
                    <circle cx={cx} cy={cy} r={4} fill="#B83030" stroke="#0D0F12" strokeWidth={2} />
                  );
                }
                return <circle cx={cx} cy={cy} r={0} />;
              }}
              activeDot={{ r: 4, fill: '#E8ECF4' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
