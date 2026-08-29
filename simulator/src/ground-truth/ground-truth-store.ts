export interface GroundTruthEvent {
  id: string;
  type: 'BOTTLENECK_START' | 'BOTTLENECK_END' | 'DEFECT_INTRODUCED' | 'EQUIPMENT_DEGRADATION_START' | 'SENSOR_FAILURE' | 'TORQUE_DRIFT_START';
  stationId: string;
  unitId?: string;
  timestamp: Date;
  parameters: Record<string, unknown>;
}

export class GroundTruthStore {
  private events: GroundTruthEvent[] = [];

  public addGroundTruthEvent(event: Omit<GroundTruthEvent, 'id'>): void {
    const id = `gt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.events.push({ ...event, id });
  }

  public getGroundTruthForPeriod(from: Date, to: Date): GroundTruthEvent[] {
    return this.events.filter(e => e.timestamp >= from && e.timestamp <= to);
  }

  public isBottleneckAt(stationId: string, timestamp: Date): boolean {
    const relevant = this.events.filter(e => 
      e.stationId === stationId && 
      (e.type === 'BOTTLENECK_START' || e.type === 'BOTTLENECK_END') &&
      e.timestamp <= timestamp
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (relevant.length === 0) return false;
    return relevant[0].type === 'BOTTLENECK_START';
  }

  public isDefectRiskAt(stationId: string, timestamp: Date): boolean {
    const relevant = this.events.filter(e => 
      e.stationId === stationId && 
      (e.type === 'EQUIPMENT_DEGRADATION_START' || e.type === 'TORQUE_DRIFT_START') &&
      e.timestamp <= timestamp
    );
    return relevant.length > 0;
  }
  
  public reset(): void {
    this.events = [];
  }
}
