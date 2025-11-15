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
  player: Player;
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

    private rooms: Map<string, PlayerConnection[]> = new Map();
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
        return true
    }

    public start(): void {
        this.setupGracefulShutdown();

        this.server.listen(websocket_port, () => {
            console.log(`✅ WebSocket server listening on ${websocket_url}`);
        });
    }

    public registerPlayer(ws: WebSocket, roomId: string, player: Player): void {
        
    }

    public broadcastToRoom(roomId: string, message: any, excludePlayerId?: string): void {
        
      
    }

    public sendToPlayer(roomId: string, playerId: string, message: any): void {
        
    }

    public broadcastToAllInRoom(roomId: string, message: any): void {
        const player_conn_in_room = this.rooms.get(roomId);
        if (player_conn_in_room) {
            for (const playerConn of player_conn_in_room) {
                // do something with playerConn
                playerConn.ws.send(JSON.stringify(message))
            }
        }
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
                const roomId = message.value.roomId
                const player = message.value.current_player as Player

                if (this.rooms.has(roomId)) {
                  let playerConn: PlayerConnection = {
                    ws: ws,
                    player_id: player.player_id,
                    player: player
                  }

                  let playerconnArr = this.rooms.get(roomId)
                  if (playerconnArr === undefined) {
                    playerconnArr = []
                  }

                  playerconnArr.push(playerConn)
                  this.rooms.set(roomId, playerconnArr);
                } else {
                  let playerConn: PlayerConnection = {
                    ws: ws,
                    player_id: player.player_id,
                    player: player
                  }

                  const playerconnArr = [playerConn]
                  this.rooms.set(roomId, playerconnArr);
                }

                console.log("Logging the room: ", this.rooms.get(roomId))
                if (this.rooms.get(roomId) !== undefined && this.rooms.get(roomId)?.length === 2) {
                  console.log("Both players joined so sending players joined message")
                  const message = {
                    type: GameEventTypes.GameStarted,
                    value: this.rooms.get(roomId)
                  }
                  this.broadcastToAllInRoom(roomId,message)
                }
                return;
            }

            if (message.type === GameEventTypes.KeyBoardButtonPressed) {
              
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
