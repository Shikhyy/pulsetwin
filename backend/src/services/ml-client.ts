import { env } from '../config/env.js';

export class MLClient {
  private baseUrl = env.ML_SERVICE_URL;
  private enabled = env.ML_SERVICE_ENABLED;

  async getPrediction(stationId: string, features: any) {
    if (!this.enabled) return null;
    try {
      const res = await fetch(`${this.baseUrl}/predictions/bottleneck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, features })
      });
      if (!res.ok) throw new Error('ML Service Error');
      return await res.json();
    } catch (e) {
      console.warn('ML Service unavailable:', e);
      return null;
    }
  }

  async getDefectPrediction(unitId: string, features: any) {
    if (!this.enabled) return null;
    try {
      const res = await fetch(`${this.baseUrl}/predictions/defect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, features })
      });
      if (!res.ok) throw new Error('ML Service Error');
      return await res.json();
    } catch (e) {
      console.warn('ML Service unavailable:', e);
      return null;
    }
  }

  async detectAnomalies(entityId: string, signal: string, observations: any[]) {
    if (!this.enabled) return null;
    try {
      const res = await fetch(`${this.baseUrl}/predictions/anomaly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, signal, observations })
      });
      if (!res.ok) throw new Error('ML Service Error');
      return await res.json();
    } catch (e) {
      console.warn('ML Service unavailable:', e);
      return null;
    }
  }

  async getModelInfo() {
    if (!this.enabled) return null;
    try {
      const res = await fetch(`${this.baseUrl}/models/info`);
      if (!res.ok) throw new Error('ML Service Error');
      return await res.json();
    } catch (e) {
      console.warn('ML Service unavailable:', e);
      return null;
    }
  }
}

export const mlClient = new MLClient();
