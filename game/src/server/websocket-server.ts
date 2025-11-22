// Filename: src/lib/websocket-server.ts
// server-only module: do NOT import this from React components
import 'dotenv/config';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { WEBSOCKET_PORT, NEXT_PUBLIC_WEBSOCKET_URL } from '@/lib/env_config';
import type { Player } from '@/modals/player';
import { GameEventTypes, FriendRequestPayload } from '@/types/game-events';

const websocket_port = WEBSOCKET_PORT ?? 8002;
const websocket_url = NEXT_PUBLIC_WEBSOCKET_URL ?? 'ws://localhost:8002';

// --- Type Definitions ---

interface PlayerConnection {
  ws: WebSocket;
  player_id: string;
  player: Player;
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
    onlinePlayers: Map<string, WebSocket>; 
    room_conn_map: Map<string, WebSocket>;

    private constructor() {
        this.server = http.createServer();
        this.wss = new WebSocketServer({ server: this.server });
        this.room_conn_map = new Map();
        this.onlinePlayers = new  Map();
        this.setupListeners();
    }

    public static getInstance(): GameServer {
        if (!GameServer.instance) {
            GameServer.instance = new GameServer();
        }
        return GameServer.instance;
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

    private updatePlayerInDb(player: Player | undefined, roomId: string | null, game_result: "won" | "lost") {
      if (player === undefined) return;
      // Use absolute URL since this is running on the server and does not have access to Next.js relative API routes
      // Adjust base URL as needed for your backend server setup
      const apiUrl = `http://localhost:3000/api/update_user`;

      fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId: player.player_id,
          ratingIncrement: 8,
          game_result,
          roomId
        })
      })
        .then(async res => {
          if (!res.ok) {
            console.error('Failed to update user rating for winner');
            return;
          }
          const result = await res.json();
          if (!result.success) {
            console.error('API responded with failure for winner:', result.message);
          }
        })
        .catch(err => {
          console.error('Error updating user rating for winner:', err);
        });
    }

    private deleteRoom(roomId: string) {
      fetch("http://localhost:3000/api/delete_game_room", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: roomId
        })
      }).then(async res => {
        if (!res.ok) {
          console.error('Failed to delete game room');
          return;
        }
        const result = await res.json();
        if (!result.success) {
          console.error('API responded with failure for delete_game_room:', result.message);
        }
      })
      .catch(err => {
        console.error('Error deleting game room:', err);
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

    private broadcastGlobal(message: any) {
        for (const client of this.onlinePlayers.values()) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        }
    }

    private handleMessage(ws: WebSocket, rawMessage: string | Buffer): void {
        try {
            const message: any = JSON.parse(rawMessage.toString());

            if (message.type === GameEventTypes.GameStarted) {
              console.log("Game started event received on ws server...", message)
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

                if (this.rooms.get(roomId) !== undefined && this.rooms.get(roomId)?.length === 2) {
                  const message = {
                    type: GameEventTypes.GameStarted,
                    value: this.rooms.get(roomId)
                  }
                  this.broadcastToAllInRoom(roomId,message)
                }
                return;
            }

            else if (message.type === GameEventTypes.GameStartedAI){
              
              const roomId = message.value.roomId
              const players = message.value.players
              console.log("Message of ai game: ", message.value)
              let playerConn: PlayerConnection = {
                ws: ws,
                player_id: players[0].player_id,
                player: players[0]
              }

              let AiPlayerConn: PlayerConnection = {
                ws: ws,
                player_id: players[1].player_id,
                player: players[1]
              }
              this.rooms.set(roomId, [playerConn, AiPlayerConn])

              const aiGameStartedMsg = {
                type: GameEventTypes.GameStartedAI,
                value: {
                  players: message.value.players
                }
              }

              ws.send(JSON.stringify(aiGameStartedMsg))
              return
            }

            else if (message.type === GameEventTypes.KeyBoardButtonPressed) {
              
              const valid_keypresses = ["u", "f", "b", "d", "l", "r", "U", "F", "B", "D", "L", "R"];
              const keybutton_pressed = message.value.keyboardButton
              const clockwise = message.value.clockwise

              if (valid_keypresses.includes(keybutton_pressed)) {
                const kb_event_msg = {
                  type: GameEventTypes.KeyBoardButtonPressed,
                  value: {
                    player: message.value.player as Player,
                    keybutton_pressed,
                    clockwise
                  }
                }
                const roomId = message.value.roomId
                this.broadcastToAllInRoom(roomId, kb_event_msg)
              } else{
                console.log("Ignoring these buttons..")
              }
              return;
            }

            else if (message.type === GameEventTypes.GameFinished) {
              const playerConns = this.rooms.get(message.value.roomId)
              if (playerConns === undefined || playerConns.length === 0) {
                ws.send(JSON.stringify({
                  type: GameEventTypes.Error,
                  value: "game finished but players map are empty.."
                }))
                return
              }
              
              let player_won, player_lost;

              for (const playerConn of playerConns) {
                if (playerConn.player.player_id === message.value.player_id_who_won) {
                  player_won = playerConn.player as Player
                } else {
                  player_lost = playerConn.player as Player
                }

                playerConn.ws.send(JSON.stringify({
                  type: GameEventTypes.GameFinished,
                  value: {
                    player_id_who_won: player_won?.player_id,
                  }
                }))
              }

              // remove room and players from the queue
              this.deleteRoom(message.value.roomId)

              this.updatePlayerInDb(player_won, message.value.roomId, "won")
              this.updatePlayerInDb(player_lost, message.value.roomId, "lost")
              return
            }

            else if (message.type === GameEventTypes.PlayerOnline) {
              console.log(`Player ${message.value.playerId} came online.`);
              this.onlinePlayers.set(message.value.playerId, ws);

              // NEW: Broadcast to everyone that this user is now Online
              // we will send all the online player's Id in the message
              this.broadcastGlobal({
                  type: GameEventTypes.PlayerStatusUpdate,
                  value: {
                      player: Array.from(this.onlinePlayers.keys()),
                      status: "online"
                  }
              });
          }

          else if (message.type === GameEventTypes.PlayerOffline) {
              this.onlinePlayers.delete(message.value.playerId);

              // NEW: Broadcast to everyone that this user is now Offline
              this.broadcastGlobal({
                  type: GameEventTypes.PlayerStatusUpdate,
                  value: {
                    player: Array.from(this.onlinePlayers.keys()),
                      status: "offline"
                  }
              });
          }

          else if (message.type === GameEventTypes.FriendChallenge) {
            console.log("Sending challenge to opponent onlyyyy")
            const {playerId, opponentPlayerId} = message.value;

            this.onlinePlayers.get(opponentPlayerId)?.send(JSON.stringify({
              type: GameEventTypes.FriendChallenge,
              value: {
                opponentPlayerId: playerId
              }
            }
          ))
          }

            else if (message.type === GameEventTypes.SendFriendRequest) {
              const payload = message.value as FriendRequestPayload;
              const targetSocket = this.onlinePlayers.get(payload.toUserId);

              if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
                  // Send notification immediately to the specific user
                  targetSocket.send(JSON.stringify({
                      type: GameEventTypes.FriendRequestReceived,
                      value: {
                          fromUserId: payload.fromUserId,
                          fromUsername: payload.fromUsername,
                          timestamp: new Date().toISOString()
                      }
                  }));
                  console.log(`Friend request sent from ${payload.fromUserId} to ${payload.toUserId}`);
              } else {
                  console.log(`User ${payload.toUserId} is offline. Request saved to DB (logic to be added)`);
                  // Optional: Here you would save to DB if you want persistence
              }
              return;
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error processing message: ${error.message}`);
            } else {
                console.error('Unknown error processing message:', error);
            }
        }
    }

    private handleDisconnect(ws: WebSocket): void {
      // Find and remove the player from online map on disconnect
      for (const [playerId, socket] of this.onlinePlayers.entries()) {
          if (socket === ws) {
              this.onlinePlayers.delete(playerId);
              break;
          }
      }
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
