import { create } from 'zustand';

export interface Prediction { id: string; stationId: string; type: string; probability: number; horizonMinutes: number; confidence: number; }

interface PredictionStore {
  predictions: Record<string, Prediction>;
  byStation: Record<string, string[]>;
  addPrediction: (p: Prediction) => void;
  removePrediction: (id: string) => void;
  getStationPredictions: (stationId: string) => Prediction[];
  getHighestRisk: (stationId: string) => Prediction | null;
}

export const usePredictionStore = create<PredictionStore>((set, get) => ({
  predictions: {},
  byStation: {},
  addPrediction: (p) => set(s => ({ 
    predictions: { ...s.predictions, [p.id]: p },
    byStation: { ...s.byStation, [p.stationId]: [...(s.byStation[p.stationId] || []), p.id] }
  })),
  removePrediction: (id) => set(s => {
    const p = s.predictions[id];
    if (!p) return s;
    const { [id]: _, ...restPreds } = s.predictions;
    return { predictions: restPreds, byStation: { ...s.byStation, [p.stationId]: s.byStation[p.stationId].filter(x => x !== id) } };
  }),
  getStationPredictions: (stationId) => {
    const state = get();
    return (state.byStation[stationId] || []).map(id => state.predictions[id]);
  },
  getHighestRisk: (stationId) => {
    const preds = get().getStationPredictions(stationId);
    if (!preds.length) return null;
    return preds.reduce((prev, curr) => (curr.probability > prev.probability ? curr : prev));
  }
}));
