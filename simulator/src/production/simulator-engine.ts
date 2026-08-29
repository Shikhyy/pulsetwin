import { config } from '../config';
import { SeededRng } from '../rng';
import { FACTORY_STATIONS, StationConfig } from '../factory/factory-layout';
import { ProductionUnitState, StationProductionState } from '../production/production-state';
import { TelemetryGenerator } from '../telemetry/telemetry-generator';
import { GroundTruthStore } from '../ground-truth/ground-truth-store';
import { SimulatedPlc } from '../plc/simulated-plc';
import { DEMO_SCENARIO, ScenarioEvent } from '../scenarios/demo-scenario';
import { BackendClient } from '../api/backend-client';

export class SimulatorEngine {
  private isRunning: boolean = false;
  private timeScale: number = config.SIMULATOR_TIME_SCALE;
  private tickMs: number = config.SIMULATOR_TICK_MS;
  private currentVirtualTime: Date;
  private startRealTime: number = 0;
  private startVirtualTime: Date;
  
  private rng: SeededRng;
  private groundTruth: GroundTruthStore;
  private telemetry: TelemetryGenerator;
  private plc: SimulatedPlc;
  private backend: BackendClient;

  private stations: Map<string, StationConfig> = new Map();
  private stationStates: Map<string, StationProductionState> = new Map();
  private units: Map<string, ProductionUnitState> = new Map();
  private activeScenarioEvents: ScenarioEvent[] = [];
  
  private nextUnitArrivalVirtualTime: Date;
  private unitCounter: number = 0;

  constructor() {
    this.rng = new SeededRng(config.DEMO_SEED);
    this.groundTruth = new GroundTruthStore();
    this.telemetry = new TelemetryGenerator(this.rng, this.groundTruth);
    this.plc = new SimulatedPlc();
    this.backend = new BackendClient(config.BACKEND_URL);
    
    this.currentVirtualTime = new Date();
    this.startVirtualTime = new Date(this.currentVirtualTime);
    this.nextUnitArrivalVirtualTime = new Date(this.currentVirtualTime.getTime() + 1000); // 1s later
    
    FACTORY_STATIONS.forEach(s => {
      this.stations.set(s.id, s);
      this.stationStates.set(s.id, {
        stationId: s.id,
        currentUnitId: null,
        queuedUnitIds: [],
        isRunning: false,
        isBlocked: false,
        isStarved: true,
        currentCycleTime: s.cycleTimeTarget,
        utilization: 0,
        lastEventAt: this.currentVirtualTime
      });
    });
  }

  public async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startRealTime = Date.now();
    
    console.log(`[SimulatorEngine] Started. Time Scale: ${this.timeScale}x`);
    this.loop();
  }

  public stop() {
    this.isRunning = false;
  }

  public setTimeAcceleration(scale: number) {
    this.timeScale = scale;
    console.log(`[SimulatorEngine] Time acceleration set to ${scale}x`);
  }

  public triggerScenario() {
    this.activeScenarioEvents = [...DEMO_SCENARIO];
    console.log(`[SimulatorEngine] Triggered scenario. Events queued: ${this.activeScenarioEvents.length}`);
  }

  private async loop() {
    if (!this.isRunning) return;

    const tickStart = Date.now();
    const virtualMsToAdvance = this.tickMs * this.timeScale;
    
    this.currentVirtualTime = new Date(this.currentVirtualTime.getTime() + virtualMsToAdvance);
    
    this.processScenarios();
    this.processProduction(virtualMsToAdvance);
    await this.generateAndPushTelemetry(virtualMsToAdvance);

    const tickDuration = Date.now() - tickStart;
    const delay = Math.max(0, this.tickMs - tickDuration);
    
    setTimeout(() => this.loop(), delay);
  }

  private processScenarios() {
    const elapsedMinutes = (this.currentVirtualTime.getTime() - this.startVirtualTime.getTime()) / 60000;
    
    const eventsToApply = this.activeScenarioEvents.filter(e => e.offsetMinutes <= elapsedMinutes);
    this.activeScenarioEvents = this.activeScenarioEvents.filter(e => e.offsetMinutes > elapsedMinutes);

    for (const event of eventsToApply) {
      console.log(`[SimulatorEngine] Applying scenario event: ${event.type} at ${event.stationId}`);
      if (event.type === 'TORQUE_DRIFT_START') {
        this.groundTruth.addGroundTruthEvent({
          type: 'TORQUE_DRIFT_START',
          stationId: event.stationId,
          timestamp: this.currentVirtualTime,
          parameters: event.params
        });
        
        // Find normal torque mean
        const station = this.stations.get(event.stationId);
        const sensor = station?.sensors.find(s => s.signal === 'torque');
        if (sensor) {
           this.telemetry.applyDrift(
             event.stationId, 
             'torque', 
             sensor.nominalMean, 
             event.params.targetMeanAfterDrift,
             event.params.driftRatePerMinute,
             this.currentVirtualTime.getTime()
           );
        }
      } else if (event.type === 'CYCLE_TIME_DEGRADATION') {
         // Custom state logic can be added here
      }
    }
  }

  private processProduction(virtualMsAdvancing: number) {
    // 1. Arrival Process
    if (this.currentVirtualTime >= this.nextUnitArrivalVirtualTime) {
      this.spawnNewUnit();
      // Next arrival in ~8 minutes
      const arrivalDelay = this.rng.nextGaussian(8 * 60 * 1000, 30 * 1000);
      this.nextUnitArrivalVirtualTime = new Date(this.currentVirtualTime.getTime() + arrivalDelay);
    }

    // 2. Process stations from end to beginning (pull system)
    const sortedStations = Array.from(this.stations.values()).sort((a, b) => b.index - a.index);
    
    for (const station of sortedStations) {
      const state = this.stationStates.get(station.id)!;
      
      // If we have a unit in process
      if (state.currentUnitId) {
        const unit = this.units.get(state.currentUnitId)!;
        const timeInStation = this.currentVirtualTime.getTime() - unit.enteredCurrentStationAt!.getTime();
        
        // Check if cycle is complete
        if (timeInStation >= state.currentCycleTime * 1000) {
          // Attempt to move forward
          if (station.downstreamStationId) {
            const downstreamState = this.stationStates.get(station.downstreamStationId)!;
            const downstreamStation = this.stations.get(station.downstreamStationId)!;
            
            if (downstreamState.queuedUnitIds.length < downstreamStation.bufferCapacity) {
              // Move it
              downstreamState.queuedUnitIds.push(unit.id);
              state.currentUnitId = null;
              state.isRunning = false;
              state.isBlocked = false;
              
              unit.currentStationId = downstreamStation.id;
              unit.enteredCurrentStationAt = null; // will be set when it starts
              unit.status = 'WAITING';
              this.backend.postUnitUpdate(unit);
            } else {
              // Blocked
              state.isBlocked = true;
              state.isRunning = false;
            }
          } else {
            // Final station, unit completes
            state.currentUnitId = null;
            state.isRunning = false;
            unit.currentStationId = null;
            unit.status = 'COMPLETED';
            this.backend.postUnitUpdate(unit);
          }
        } else {
          // Still processing
          unit.position = timeInStation / (state.currentCycleTime * 1000);
          state.isRunning = true;
          state.isBlocked = false;
        }
      }
      
      // If empty and not blocked, try to pull from queue
      if (!state.currentUnitId && !state.isBlocked) {
        if (state.queuedUnitIds.length > 0) {
          const nextUnitId = state.queuedUnitIds.shift()!;
          const unit = this.units.get(nextUnitId)!;
          
          state.currentUnitId = nextUnitId;
          state.isRunning = true;
          state.isStarved = false;
          
          // Determine cycle time for this specific unit
          state.currentCycleTime = this.rng.nextGaussian(station.cycleTimeTarget, station.cycleTimeStd);
          
          unit.enteredCurrentStationAt = new Date(this.currentVirtualTime);
          unit.status = 'IN_PROCESS';
          this.backend.postUnitUpdate(unit);
        } else {
          state.isStarved = true;
          state.isRunning = false;
        }
      }
      
      // Update PLC
      this.plc.updateTag(station.id, 'running', state.isRunning, this.currentVirtualTime);
      this.plc.updateTag(station.id, 'blocked', state.isBlocked, this.currentVirtualTime);
      this.plc.updateTag(station.id, 'starved', state.isStarved, this.currentVirtualTime);
    }
  }

  private spawnNewUnit() {
    this.unitCounter++;
    const firstStationId = 'ST-01';
    const firstState = this.stationStates.get(firstStationId)!;
    
    const unit: ProductionUnitState = {
      id: `veh-${this.unitCounter.toString().padStart(5, '0')}`,
      serial: `VIN${this.rng.nextInt(1000, 9999)}PULSE`,
      model: this.rng.nextBool(0.7) ? 'SEDAN' : 'SUV',
      currentStationId: firstStationId,
      position: 0,
      enteredCurrentStationAt: null,
      status: 'WAITING',
      qualityFlags: []
    };
    
    this.units.set(unit.id, unit);
    firstState.queuedUnitIds.push(unit.id);
    this.backend.postUnitUpdate(unit);
  }

  private async generateAndPushTelemetry(elapsedMs: number) {
    const allObservations = [];
    
    for (const [stationId, station] of this.stations.entries()) {
      const state = this.stationStates.get(stationId)!;
      const obs = this.telemetry.generateReadings(station, state, this.currentVirtualTime, elapsedMs);
      allObservations.push(...obs);
    }

    if (allObservations.length > 0) {
      await this.backend.postObservations(allObservations);
    }
    
    await this.backend.postProductionStateUpdate(Array.from(this.stationStates.values()));
  }
}
