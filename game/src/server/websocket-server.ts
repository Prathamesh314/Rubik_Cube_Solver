// Filename: src/lib/websocket-server.ts
// server-only module: do NOT import this from React components
import 'dotenv/config';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { WEBSOCKET_PORT, NEXT_PUBLIC_WEBSOCKET_URL } from '@/lib/env_config';
import type { Room } from '@/modals/room';
import type { Player } from '@/modals/player';
import { GameEvents, GameEventTypes } from '@/types/game-events';

const websocket_port = WEBSOCKET_PORT ?? 8002;
const websocket_url = NEXT_PUBLIC_WEBSOCKET_URL ?? 'ws://localhost:8002';

// --- Type Definitions ---

interface PlayerConnection {
  ws: WebSocket;
  player_id: string;
  player?: Player;
}

interface RoomConnections {
  players: Map<string, PlayerConnection>; // player_id -> PlayerConnection
  scrambledMoves?: number[][][];
  startTime?: string;
}

interface WebSocketInfo {
  roomId: string;
  playerId: string;
}

export class GameServer {
    
    private static instance: GameServer;
    
    private server: http.Server;
    private wss: WebSocketServer;

    private rooms: Map<string, RoomConnections> = new Map();
    private wsInfoMap: Map<WebSocket, WebSocketInfo> = new Map();
    room_conn_map: Map<string, WebSocket>;

    private constructor() {
        this.server = http.createServer();
        this.wss = new WebSocketServer({ server: this.server });
        this.room_conn_map = new Map();
        
        console.log("GameServer instance created.");
        this.setupListeners();
    }

    public static getInstance(): GameServer {
        if (!GameServer.instance) {
            GameServer.instance = new GameServer();
        }
        return GameServer.instance;
    }

    private createRoom(roomId: string): boolean {
        if (this.rooms.has(roomId)) {
            console.warn(`Attempted to create a room that already exists: ${roomId}`);
            return false;
        }
        this.rooms.set(roomId, {
            players: new Map(),
        });
        console.log(`Room created: ${roomId}`);
        return true;
    }

    public start(): void {
        this.setupGracefulShutdown();

        this.server.listen(websocket_port, () => {
            console.log(`✅ WebSocket server listening on ${websocket_url}`);
        });
    }

    public registerPlayer(ws: WebSocket, roomId: string, player: Player): void {
        const { player_id } = player;

        // Ensure the room exists, or create it
        if (!this.rooms.has(roomId)) {
            this.createRoom(roomId);
        }

        const room = this.rooms.get(roomId)!;
        const playerConn: PlayerConnection = { ws, player_id, player };

        room.players.set(player_id, playerConn);
        this.wsInfoMap.set(ws, { roomId, playerId: player_id });

        console.log(`Player ${player_id} registered in room ${roomId}`);

        // Notify other players in the room
        this.broadcastToRoom(roomId, {
            type: 'PLAYER_JOINED',
            value: { player }
        }, player_id); // Exclude self
    }

    public broadcastToRoom(roomId: string, message: any, excludePlayerId?: string): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const messageStr = JSON.stringify(message);
        room.players.forEach((playerConn, playerId) => {
            if (excludePlayerId && playerId === excludePlayerId) return;
            if (playerConn.ws.readyState === WebSocket.OPEN) {
                playerConn.ws.send(messageStr);
            }
        });
    }

    public sendToPlayer(roomId: string, playerId: string, message: any): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const playerConn = room.players.get(playerId);
        if (playerConn && playerConn.ws.readyState === WebSocket.OPEN) {
            playerConn.ws.send(JSON.stringify(message));
        }
    }

    public broadcastToAllInRoom(roomId: string, message: any): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const messageStr = JSON.stringify(message);
        room.players.forEach((playerConn) => {
            if (playerConn.ws.readyState === WebSocket.OPEN) {
                playerConn.ws.send(messageStr);
            }
        });
    }

    private setupListeners(): void {
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('🔌 Client connected');

            ws.on('message', (rawMessage: GameEventTypes) => {
                this.handleMessage(ws, rawMessage);
            });

            ws.on('close', () => {
                this.handleDisconnect(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.handleDisconnect(ws); // Treat errors as disconnects
            });
        });
    }

    private handleMessage(ws: WebSocket, rawMessage: string | Buffer): void {
        try {
            const message: any = JSON.parse(rawMessage.toString());
            console.log('Received message:', message.type);

            if (message.type === GameEventTypes.GameStarted) {
                console.log("Message Received game started: ", message.value)
                const roomId = message.value.base_values.room.id;
                const ws_conn = this.room_conn_map.get(roomId);
                if (ws_conn === undefined) {
                  console.error("room is not registered properly")

                }

                ws.send(JSON.stringify({
                  "message": "Game started event recieved"
                }))
                return;
            }

            if (message.type === GameEventTypes.KeyBoardButtonPressed) {
              // export interface KeyboardButtonPressedMessageValues {
              //   room: Room | undefined;
              //   player: Player;
              //   keyboardButton: string;
              // }
              console.log("Keyboard buttons pressed.")
              const valid_keypresses = ["u", "f", "b", "d", "l", "r"]
              const keybutton_pressed = message.value.keyboardButton
              const clockwise = message.value.clockwise

              console.log("Websocket server: ", keybutton_pressed, " clockwise: ", clockwise)

              if (valid_keypresses.includes(keybutton_pressed)) {
                ws.send(JSON.stringify({
                  type: GameEventTypes.KeyBoardButtonPressed,
                  value: {
                    player: message.value.player,
                    keybutton_pressed,
                    clockwise
                  }
                }));
              } else{
                console.log("Ignoring these buttons..")
              }
              return;
            }

            if (message.type === GameEventTypes.GameFinished) {
              // export interface GameEndEventMessageValues {
              //   base_values: BaseMessageValues;
              //   player_id_who_won: string;
              //   end_time: string;
              // }

              ws.send(JSON.stringify({
                type: GameEventTypes.GameFinished,
                value: message.value
              }))
            }
            
            const info = this.wsInfoMap.get(ws);
            if (!info) {
                console.warn("Message from unregistered client. Ignoring.");
                return;
            }

            // switch(message.type) {
            //     case GameEventTypes.GameStarted:
            //         console.log("GameStarted event received...");
            //         this.broadcastToAllInRoom(info.roomId, message);
            //         break;
                
            //     case 'CUBE_UPDATE':
            //         console.log(`Cube update from ${info.playerId} in room ${info.roomId}`);
            //         // Broadcast to other players
            //         this.broadcastToRoom(info.roomId, message, info.playerId);
            //         break;
                
            // }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error processing message: ${error.message}`);
            } else {
                console.error('Unknown error processing message:', error);
            }
        }
    }

    private handleDisconnect(ws: WebSocket): void {
        console.log('Client disconnected');
        const info = this.wsInfoMap.get(ws);

        if (!info) {
            return;
        }

        const { roomId, playerId } = info;
        const room = this.rooms.get(roomId);

        if (room) {
            room.players.delete(playerId);
            
            this.broadcastToAllInRoom(roomId, {
                type: 'PLAYER_LEFT',
                value: { playerId }
            });

            if (room.players.size === 0) {
                this.rooms.delete(roomId);
                console.log(`Room ${roomId} is empty and was deleted.`);
            }
        }
        
        this.wsInfoMap.delete(ws);
        console.log(`Cleaned up disconnected player ${playerId} from room ${roomId}`);
    }

    private setupGracefulShutdown(): void {
        process.on('SIGINT', () => {
            console.log('\nSIGINT received. Closing WebSocket server...');
            this.wss.close(() => {
                this.server.close(() => {
                    console.log('WebSocket and HTTP servers closed. Exiting process.');
                    process.exit(0);
                });
            });
        });
    }
}
