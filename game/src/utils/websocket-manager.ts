// Filename: src/lib/websocket-manager.ts
import { GameEventTypes } from '@/types/game-events';

type MessageHandler = (message: any) => void;

interface RoomSubscription {
  roomId: string;
  playerId: string;
  handlers: Set<MessageHandler>;
}

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;
  
  private roomSubscriptions = new Map<string, RoomSubscription>();
  private connectionPromise: Promise<void> | null = null;
  private connectionResolve: (() => void) | null = null;

  private constructor(url: string) {
    this.url = url;
  }

  public static getInstance(url?: string): WebSocketManager {
    if (!WebSocketManager.instance) {
      if (!url) {
        throw new Error('WebSocket URL must be provided on first initialization');
      }
      WebSocketManager.instance = new WebSocketManager(url);
    }
    return WebSocketManager.instance;
  }

  public connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.connectionResolve = resolve;
      
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.isIntentionallyClosed = false;
          
          // Rejoin all subscribed rooms
          this.rejoinRooms();
          
          if (this.connectionResolve) {
            this.connectionResolve();
            this.connectionResolve = null;
          }
          this.connectionPromise = null;
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.ws = null;
          this.connectionPromise = null;
          this.connectionResolve = null;
          
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'));
            this.connectionPromise = null;
            this.connectionResolve = null;
          }
        }, 10000);
      } catch (error) {
        reject(error);
        this.connectionPromise = null;
        this.connectionResolve = null;
      }
    });

    return this.connectionPromise;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private rejoinRooms(): void {
    this.roomSubscriptions.forEach((subscription) => {
      this.sendMessage({
        type: GameEventTypes.JoinRoom,
        room_id: subscription.roomId,
        player_id: subscription.playerId,
      });
    });
  }

  public async joinRoom(roomId: string, playerId: string, handler: MessageHandler): Promise<void> {
    await this.connect();

    let subscription = this.roomSubscriptions.get(roomId);
    if (!subscription) {
      subscription = {
        roomId,
        playerId,
        handlers: new Set(),
      };
      this.roomSubscriptions.set(roomId, subscription);

      // Send join message to server
      this.sendMessage({
        type: GameEventTypes.JoinRoom,
        room_id: roomId,
        player_id: playerId,
      });
    }

    subscription.handlers.add(handler);
  }

  public leaveRoom(roomId: string, handler: MessageHandler): void {
    const subscription = this.roomSubscriptions.get(roomId);
    if (!subscription) return;

    subscription.handlers.delete(handler);

    if (subscription.handlers.size === 0) {
      this.roomSubscriptions.delete(roomId);
      
      // Send leave message to server
      this.sendMessage({
        type: GameEventTypes.LeaveRoom,
        room_id: roomId,
        player_id: subscription.playerId,
      });
    }
  }

  public sendMessage(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  private handleMessage(message: any): void {
    // Handle room-specific messages
    const roomId = message.room_id || message.value?.base_values?.room?.id;
    
    if (roomId) {
      const subscription = this.roomSubscriptions.get(roomId);
      if (subscription) {
        subscription.handlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      }
    } else {
      // Broadcast to all handlers if no room specified
      this.roomSubscriptions.forEach((subscription) => {
        subscription.handlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      });
    }
  }

  public disconnect(): void {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.roomSubscriptions.clear();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public getReadyState(): number | undefined {
    return this.ws?.readyState;
  }
}

export default WebSocketManager;