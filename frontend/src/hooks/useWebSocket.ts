import { useEffect, useRef } from 'react';
import { useTwinStore } from '../stores/twinStore';
import { usePredictionStore } from '../stores/predictionStore';

export default function useWebSocket() {
  const { setStationState, setProductionUnit, addAlert, addPulseEvent, setConnected } = useTwinStore();
  const { addPrediction } = usePredictionStore();
  const ws = useRef<WebSocket | null>(null);
  const backoff = useRef(1000);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws');
      ws.current.onopen = () => {
        setConnected(true);
        backoff.current = 1000;
        ws.current?.send(JSON.stringify({ type: 'subscribe', payload: 'all' }));
      };
      ws.current.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          const payload = data.payload || data;
          switch (data.type) {
            case 'STATION_STATE_CHANGED':
              setStationState(payload.stationId || payload.targetId, payload);
              break;
            case 'PRODUCTION_UNIT_MOVED':
              if (payload.unit) setProductionUnit(payload.unit.id, payload.unit);
              break;
            case 'PREDICTION_CREATED':
              addPrediction({ ...payload, stationId: payload.targetId });
              addPulseEvent({ id: payload.id, stationId: payload.targetId, type: 'bottleneck', triggeredAt: Date.now(), downstreamStationIds: [] });
              break;
            case 'ANOMALY_DETECTED':
              addAlert({ ...payload, id: payload.id || crypto.randomUUID(), dismissed: false, severity: 'WARNING', type: 'ANOMALY', message: payload.description || 'Anomaly detected' });
              break;
            case 'PULSE_TRIGGERED':
              addPulseEvent(payload);
              break;
            case 'TELEMETRY_UPDATE':
              if (payload.targetId && payload.metrics) {
                setStationState(payload.targetId, { riskLevel: payload.metrics.bottleneck_risk ?? 0 });
              }
              break;
          }
        } catch (e) {}
      };
      ws.current.onclose = () => {
        setConnected(false);
        setTimeout(connect, backoff.current);
        backoff.current = Math.min(backoff.current * 2, 30000);
      };
    };
    connect();
    return () => ws.current?.close();
  }, [setStationState, setProductionUnit, addAlert, addPulseEvent, setConnected, addPrediction]);

  const sendMessage = (msg: any) => ws.current?.readyState === WebSocket.OPEN && ws.current.send(JSON.stringify(msg));
  return { sendMessage };
}
