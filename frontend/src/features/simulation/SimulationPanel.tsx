import React, { useState } from 'react';
import { ScenarioEditor } from './ScenarioEditor';
import { ComparisonPanel } from './ComparisonPanel';
import { useApi } from '../../hooks/useApi';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const SimulationPanel: React.FC = () => {
  const { post, loading } = useApi();
  const [results, setResults] = useState<any>(null);
  const [editorCollapsed, setEditorCollapsed] = useState(false);

  const handleRunSimulation = async (params: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResults({
        success: true,
        params,
        impact: {
          throughputChange: 5.4,
          defectRateChange: -12.5,
        },
      });
      // Auto-expand results
      setEditorCollapsed(true);
    } catch (err) {
      console.error('Simulation failed', err);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans bg-root text-text-primary overflow-hidden">

      {/* Scenario editor — collapsible */}
      <div className="flex flex-col border-b border-border">
        <button
          onClick={() => setEditorCollapsed(v => !v)}
          className="flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors"
        >
          <span className="label-sm">Scenario Parameters</span>
          {editorCollapsed
            ? <ChevronDown className="w-4 h-4 text-text-muted" />
            : <ChevronUp className="w-4 h-4 text-text-muted" />
          }
        </button>

        {!editorCollapsed && (
          <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
            <ScenarioEditor onRunSimulation={handleRunSimulation} isLoading={loading} />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {results ? (
          <div className="p-4">
            <ComparisonPanel results={results} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
            <div className="w-12 h-12 bg-surface-2 border border-border rounded flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-state-simulated rounded-full" />
            </div>
            <p className="text-xs text-text-muted">Configure parameters above and run a simulation to see predicted outcomes here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
