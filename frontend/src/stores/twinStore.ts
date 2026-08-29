import { create } from 'zustand';

export interface StationState { status: string; riskLevel: number; }
export interface ProductionUnit { id: string; currentStation: string; }
export interface Alert {
  id: string; stationId: string; type: 'BOTTLENECK' | 'QUALITY' | 'EQUIPMENT' | 'ANOMALY';
  severity: 'WARNING' | 'CRITICAL'; message: string; timestamp: string; dismissed: boolean;
}
export interface PulseEvent { id: string; stationId: string; type: 'bottleneck' | 'quality'; triggeredAt: number; downstreamStationIds: string[]; }

interface TwinStore {
  stations: Record<string, StationState>;
  productionUnits: Record<string, ProductionUnit>;
  activeAlerts: Alert[];
  selectedStationId: string | null;
  selectedUnitId: string | null;
  pulseEvents: PulseEvent[];
  isConnected: boolean;
  lastUpdate: string | null;
  setStationState: (stationId: string, state: Partial<StationState>) => void;
  setProductionUnit: (unitId: string, unit: ProductionUnit) => void;
  selectStation: (stationId: string | null) => void;
  selectUnit: (unitId: string | null) => void;
  addPulseEvent: (event: PulseEvent) => void;
  removePulseEvent: (eventId: string) => void;
  setConnected: (connected: boolean) => void;
  batchUpdateStations: (states: Record<string, StationState>) => void;
  addAlert: (alert: Alert) => void;
  dismissAlert: (alertId: string) => void;
}

export const useTwinStore = create<TwinStore>((set) => ({
  stations: {}, productionUnits: {}, activeAlerts: [], selectedStationId: null, selectedUnitId: null, pulseEvents: [], isConnected: false, lastUpdate: null,
  setStationState: (id, state) => set(s => ({ stations: { ...s.stations, [id]: { ...s.stations[id], ...state } } })),
  setProductionUnit: (id, unit) => set(s => ({ productionUnits: { ...s.productionUnits, [id]: unit } })),
  selectStation: (id) => set({ selectedStationId: id }),
  selectUnit: (id) => set({ selectedUnitId: id }),
  addPulseEvent: (ev) => set(s => ({ pulseEvents: [...s.pulseEvents, ev] })),
  removePulseEvent: (id) => set(s => ({ pulseEvents: s.pulseEvents.filter(e => e.id !== id) })),
  setConnected: (c) => set({ isConnected: c }),
  batchUpdateStations: (states) => set(s => ({ stations: { ...s.stations, ...states } })),
  addAlert: (a) => set(s => ({ activeAlerts: [...s.activeAlerts, a] })),
  dismissAlert: (id) => set(s => ({ activeAlerts: s.activeAlerts.map(a => a.id === id ? { ...a, dismissed: true } : a) }))
}));
