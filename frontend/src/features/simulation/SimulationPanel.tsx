import React, { useState } from 'react';
import { ScenarioEditor } from './ScenarioEditor';
import { ComparisonPanel } from './ComparisonPanel';
import { useApi } from '../../hooks/useApi';

export const SimulationPanel: React.FC = () => {
  const { post, loading } = useApi();
  const [results, setResults] = useState<any>(null);

  const handleRunSimulation = async (params: any) => {
    try {
      // Mock API call based on the instructions
      // const response = await post('/api/simulations', params);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResults({
        success: true,
        params,
        impact: {
          throughputChange: 5.4,
          defectRateChange: -12.5
        }
      });
    } catch (err) {
      console.error('Simulation failed', err);
    }
  };

  return (
    <div className="flex h-full font-['Inter'] bg-[#0D0F12] text-[#E8ECF4]">
      {/* Left Column: Editor */}
      <div className="w-[320px] lg:w-[400px] border-r border-[#2A3048] bg-[#141720] p-5 flex flex-col overflow-y-auto">
        <h2 className="text-lg font-semibold mb-6">Simulation Sandbox</h2>
        <ScenarioEditor onRunSimulation={handleRunSimulation} isLoading={loading} />
      </div>

      {/* Right Column: Results */}
      <div className="flex-1 p-5 overflow-y-auto bg-[#0D0F12]">
        <div className="max-w-3xl mx-auto h-full">
          <ComparisonPanel results={results} />
        </div>
      </div>
    </div>
  );
};
