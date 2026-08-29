export interface PlcTagValue {
  name: string;
  value: string | number | boolean;
  timestamp: Date;
}

export interface PlcAlarm {
  id: string;
  stationId: string;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  timestamp: Date;
}

export interface PlcCycleEvent {
  stationId: string;
  unitId: string;
  durationMs: number;
  timestamp: Date;
}

export interface IPlcAdapter {
  readTag(stationId: string, tagName: string): PlcTagValue | null;
  subscribeToAlarms(callback: (alarm: PlcAlarm) => void): void;
  getCycleEvents(): PlcCycleEvent[];
}

export class SimulatedPlc implements IPlcAdapter {
  private tags: Map<string, PlcTagValue> = new Map();
  private alarms: PlcAlarm[] = [];
  private cycleEvents: PlcCycleEvent[] = [];
  private alarmCallbacks: ((alarm: PlcAlarm) => void)[] = [];

  public updateTag(stationId: string, tagName: string, value: string | number | boolean, timestamp: Date) {
    const key = `${stationId}.${tagName}`;
    this.tags.set(key, { name: tagName, value, timestamp });
  }

  public readTag(stationId: string, tagName: string): PlcTagValue | null {
    return this.tags.get(`${stationId}.${tagName}`) || null;
  }

  public emitAlarm(alarm: Omit<PlcAlarm, 'id'>) {
    const fullAlarm: PlcAlarm = { ...alarm, id: `al-${Date.now()}-${Math.random().toString(36).substring(7)}` };
    this.alarms.push(fullAlarm);
    this.alarmCallbacks.forEach(cb => cb(fullAlarm));
  }

  public subscribeToAlarms(callback: (alarm: PlcAlarm) => void): void {
    this.alarmCallbacks.push(callback);
  }

  public recordCycleEvent(event: PlcCycleEvent) {
    this.cycleEvents.push(event);
  }

  public getCycleEvents(): PlcCycleEvent[] {
    const events = [...this.cycleEvents];
    this.cycleEvents = []; // clear after reading
    return events;
  }
}
