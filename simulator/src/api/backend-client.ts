import axios from 'axios';
import { Observation } from '../telemetry/telemetry-generator';
import { ProductionUnitState, StationProductionState } from '../production/production-state';
import { PlcAlarm } from '../plc/simulated-plc';

export class BackendClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async postObservations(observations: Observation[]): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/telemetry/batch`, { observations });
    } catch (error: any) {
      console.warn(`[BackendClient] Failed to post observations: ${error.message}`);
    }
  }

  public async postProductionStateUpdate(states: StationProductionState[]): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/production/states`, { states });
    } catch (error: any) {
      console.warn(`[BackendClient] Failed to post production states: ${error.message}`);
    }
  }

  public async postUnitUpdate(unit: ProductionUnitState): Promise<void> {
    try {
      await axios.put(`${this.baseUrl}/production/units/${unit.id}`, unit);
    } catch (error: any) {
      console.warn(`[BackendClient] Failed to post unit update ${unit.id}: ${error.message}`);
    }
  }

  public async postAlarm(alarm: PlcAlarm): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/alarms`, alarm);
    } catch (error: any) {
      console.warn(`[BackendClient] Failed to post alarm: ${error.message}`);
    }
  }
}

