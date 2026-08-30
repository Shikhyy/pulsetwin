import React, { useState } from 'react';
import { FACTORY_CONFIG } from '../../lib/factory-config';

interface ScenarioEditorProps {
  onRunSimulation: (params: any) => void;
  isLoading: boolean;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({ onRunSimulation, isLoading }) => {
  const [station, setStation] = useState('ST-02');
  const [parameter, setParameter] = useState('cycle_time');
  const [changePercent, setChangePercent] = useState(0);
  const [duration, setDuration] = useState('60m');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunSimulation({ station, parameter, changePercent, duration });
  };

  return (
    <div className="flex flex-col gap-4 font-['Inter']">
      <h3 className="text-sm font-semibold text-[#E8ECF4] uppercase tracking-wider mb-2">Scenario Editor</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="label-xs text-text-muted">Target Station</label>
          <select 
            value={station}
            onChange={(e) => setStation(e.target.value)}
            className="bg-surface border border-border text-text-primary text-sm rounded p-2 focus:outline-none focus:border-accent"
          >
            {FACTORY_CONFIG.stations.map(st => (
              <option key={st.id} value={st.id}>{st.id} - {st.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#8B93AB] uppercase">Parameter</label>
          <select 
            value={parameter}
            onChange={(e) => setParameter(e.target.value)}
            className="bg-[#141720] border border-[#2A3048] text-[#E8ECF4] text-sm rounded p-2 focus:outline-none focus:border-[#3B82F6]"
          >
            <option value="cycle_time">Cycle Time</option>
            <option value="failure_rate">Failure Rate</option>
            <option value="capacity">Capacity</option>
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#8B93AB] uppercase">Adjustment</label>
            <span className={`text-xs font-['JetBrains_Mono'] ${changePercent > 0 ? 'text-[#B83030]' : changePercent < 0 ? 'text-[#2A9D4E]' : 'text-[#E8ECF4]'}`}>
              {changePercent > 0 ? '+' : ''}{changePercent}%
            </span>
          </div>
          <input 
            type="range" 
            min="-50" 
            max="50" 
            step="5"
            value={changePercent}
            onChange={(e) => setChangePercent(Number(e.target.value))}
            className="w-full accent-[#3B82F6]"
          />
          <div className="flex justify-between text-[10px] text-[#8B93AB]">
            <span>-50%</span>
            <span>0%</span>
            <span>+50%</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#8B93AB] uppercase">Simulation Duration</label>
          <div className="grid grid-cols-4 gap-2">
            {['15m', '30m', '60m', '2h'].map(dur => (
              <button
                key={dur}
                type="button"
                onClick={() => setDuration(dur)}
                className={`py-1.5 text-xs rounded border transition-colors ${
                  duration === dur 
                    ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]' 
                    : 'bg-[#141720] border-[#2A3048] text-[#8B93AB] hover:border-[#8B93AB]'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-4 bg-[#7B2AC8] hover:bg-[#6B21A8] disabled:opacity-50 disabled:cursor-not-allowed text-[#E8ECF4] text-sm font-medium py-2.5 rounded transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </form>
    </div>
  );
};
