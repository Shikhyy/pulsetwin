import { create } from 'zustand';

export interface ScenarioInput { stationId: string; parameter: 'cycle_time' | 'failure_rate' | 'capacity'; changePercent: number; durationMinutes: number; }
export interface SimulationResult { throughput: number; bottleneckRisk: number; qualityYield: number; }

interface SimulationStore {
  currentScenario: ScenarioInput | null;
  results: SimulationResult | null;
  baselineResults: SimulationResult | null;
  isRunning: boolean;
  setScenario: (s: ScenarioInput | null) => void;
  setResults: (r: SimulationResult | null) => void;
  setRunning: (running: boolean) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  currentScenario: null,
  results: null,
  baselineResults: null,
  isRunning: false,
  setScenario: (s) => set({ currentScenario: s }),
  setResults: (r) => set({ results: r }),
  setRunning: (running) => set({ isRunning: running }),
  reset: () => set({ currentScenario: null, results: null, isRunning: false })
}));
