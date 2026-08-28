import type WebSocket from 'ws';

export interface TwinEvent {
  type: string;
  payload: any;
  timestamp: string;
}

class WebSocketManager {
  private clients: Set<WebSocket> = new Set();
  private stationSubscriptions: Map<string, Set<WebSocket>> = new Map();

  addClient(ws: WebSocket): void {
    this.clients.add(ws);

    ws.on('message', (message: string) => {
      try {
        this.handleMessage(ws, message);
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    });

    ws.on('close', () => {
      this.removeClient(ws);
    });
  }

  removeClient(ws: WebSocket): void {
    this.clients.delete(ws);
    for (const [stationId, subscribers] of this.stationSubscriptions.entries()) {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.stationSubscriptions.delete(stationId);
      }
    }
  }

  handleMessage(ws: WebSocket, message: string): void {
    const data = JSON.parse(message.toString());
    if (data.type === 'subscribe' && data.stationId) {
      if (!this.stationSubscriptions.has(data.stationId)) {
        this.stationSubscriptions.set(data.stationId, new Set());
      }
      this.stationSubscriptions.get(data.stationId)!.add(ws);
    } else if (data.type === 'unsubscribe' && data.stationId) {
      if (this.stationSubscriptions.has(data.stationId)) {
        this.stationSubscriptions.get(data.stationId)!.delete(ws);
      }
    }
  }

  broadcastEvent(event: TwinEvent): void {
    const message = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    }
  }

  broadcastToStation(stationId: string, event: TwinEvent): void {
    const subscribers = this.stationSubscriptions.get(stationId);
    if (!subscribers) return;

    const message = JSON.stringify(event);
    for (const client of subscribers) {
      if (client.readyState === 1) {
        client.send(message);
      }
    }
  }
  
  getConnectedCount(): number {
    return this.clients.size;
  }
}

export const wsManager = new WebSocketManager();
