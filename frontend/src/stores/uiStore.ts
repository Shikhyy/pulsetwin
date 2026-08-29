import { create } from 'zustand';

type AppMode = 'operations' | 'investigation' | 'simulation' | 'planning' | 'leadership';

interface UIStore {
  mode: AppMode;
  contextPanelTab: 'station' | 'vehicle' | 'prediction' | 'simulation';
  layerVisibility: { equipment: boolean; productionUnits: boolean; riskOverlay: boolean; simulationOverlay: boolean; conveyors: boolean; };
  cameraMode: 'orbit' | 'station-focus' | 'line-overview';
  showDemoBar: boolean;
  setMode: (mode: AppMode) => void;
  setContextPanelTab: (tab: UIStore['contextPanelTab']) => void;
  toggleLayer: (layer: keyof UIStore['layerVisibility']) => void;
  setCameraMode: (mode: UIStore['cameraMode']) => void;
}

export const useUiStore = create<UIStore>((set) => ({
  mode: 'operations',
  contextPanelTab: 'station',
  layerVisibility: { equipment: true, productionUnits: true, riskOverlay: false, simulationOverlay: false, conveyors: true },
  cameraMode: 'orbit',
  showDemoBar: true,
  setMode: (mode) => set({ mode }),
  setContextPanelTab: (tab) => set({ contextPanelTab: tab }),
  toggleLayer: (layer) => set(s => ({ layerVisibility: { ...s.layerVisibility, [layer]: !s.layerVisibility[layer] } })),
  setCameraMode: (mode) => set({ cameraMode: mode })
}));
