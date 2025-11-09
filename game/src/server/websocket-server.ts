// Filename: src/lib/websocket-server.ts
// server-only module: do NOT import this from React components
import 'dotenv/config';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { WEBSOCKET_PORT, NEXT_PUBLIC_WEBSOCKET_URL } from '@/lib/env_config';
import type { Room } from '@/modals/room';
import type { Player } from '@/modals/player';
import { GameEventTypes, type GameEvents, type JoinRoomMessage, type LeaveRoomMessage, type PlayerMoveMessage } from '@/types/game-events';
import { applyMove } from '@/components/cube';

const websocket_port = WEBSOCKET_PORT ?? 8002;
const websocket_url = NEXT_PUBLIC_WEBSOCKET_URL ?? 'ws://localhost:8002';

// Store active rooms and their connections
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

const server = http.createServer();
const wss = new WebSocketServer({ server });

const rooms = new Map<string, RoomConnections>();
const wsToPlayer = new Map<WebSocket, { room_id: string; player_id: string }>();

// Broadcast message to all players in a room except the sender
function broadcastToRoom(roomId: string, message: any, excludePlayerId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  room.players.forEach((playerConn, playerId) => {
    if (excludePlayerId && playerId === excludePlayerId) return;
    if (playerConn.ws.readyState === WebSocket.OPEN) {
      playerConn.ws.send(messageStr);
    }
  });
}

// Send message to a specific player in a room
function sendToPlayer(roomId: string, playerId: string, message: any) {
  const room = rooms.get(roomId);
  if (!room) return;

  const playerConn = room.players.get(playerId);
  if (playerConn && playerConn.ws.readyState === WebSocket.OPEN) {
    playerConn.ws.send(JSON.stringify(message));
  }
}

// Send message to all players in a room including sender
function broadcastToAllInRoom(roomId: string, message: any) {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  room.players.forEach((playerConn) => {
    if (playerConn.ws.readyState === WebSocket.OPEN) {
      playerConn.ws.send(messageStr);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (rawMessage) => {
    try {
      const message: any = JSON.parse(rawMessage.toString());
      console.log('Received message:', message.type);

      switch (message.type) {
        case GameEventTypes.JoinRoom: {
          const { room_id, player_id, player } = message as JoinRoomMessage;
          console.log(`Player ${player_id} joining room ${room_id}`);

          if (!room_id || !player_id) {
            ws.send(JSON.stringify({ 
              type: GameEventTypes.Error, 
              error: 'room_id and player_id are required' 
            }));
            return;
          }

          // Get or create room
          let roomData = rooms.get(room_id);
          if (!roomData) {
            roomData = {
              players: new Map(),
            };
            rooms.set(room_id, roomData);
          }

          // Add player to room
          roomData.players.set(player_id, { ws, player_id, player });
          wsToPlayer.set(ws, { room_id, player_id });

          // Send confirmation to the player
          ws.send(JSON.stringify({
            type: GameEventTypes.RoomJoined,
            room_id,
            player_id,
            players_count: roomData.players.size
          }));

          console.log(`Room ${room_id} now has ${roomData.players.size} players`);
          break;
        }

        case GameEventTypes.LeaveRoom: {
          const { room_id, player_id } = message as LeaveRoomMessage;
          console.log(`Player ${player_id} leaving room ${room_id}`);

          const roomData = rooms.get(room_id);
          if (roomData) {
            roomData.players.delete(player_id);
            if (roomData.players.size === 0) {
              rooms.delete(room_id);
              console.log(`Room ${room_id} deleted (no players left)`);
            }
          }
          wsToPlayer.delete(ws);
          break;
        }

        case GameEventTypes.GameStarted: {
          console.log(`Event received: ${GameEventTypes.GameStarted}`);
          const roomId = message.value.base_values.room?.id;
          if (!roomId) {
            ws.send(JSON.stringify({ 
              type: GameEventTypes.Error, 
              error: 'No room ID provided' 
            }));
            return;
          }

          const roomData = rooms.get(roomId);
          if (!roomData) {
            ws.send(JSON.stringify({ 
              type: GameEventTypes.Error, 
              error: 'Room not found' 
            }));
            return;
          }

          // Store scrambled cube and start time
          roomData.scrambledMoves = message.value.scrambled_cube;
          roomData.startTime = message.value.start_time ?? new Date().toISOString();

          const gameStartMessage: GameEvents = {
            type: GameEventTypes.GameStarted,
            value: {
              base_values: message.value.base_values,
              scrambled_cube: roomData.scrambledMoves ?? [[[]]],
              start_time: roomData.startTime ?? new Date().toISOString(),
            },
          };

          // Broadcast to all players in the room
          broadcastToAllInRoom(roomId, gameStartMessage);
          console.log(`Game started in room ${roomId}`);
          break;
        }

        case GameEventTypes.PlayerMove: {
          const moveMessage = message as PlayerMoveMessage;
          console.log(`Player ${moveMessage.player_id} moved: ${moveMessage.move} in room ${moveMessage.room_id}`);

          // Broadcast move to all OTHER players in the room
          broadcastToRoom(moveMessage.room_id, moveMessage, moveMessage.player_id);
          break;
        }

        case GameEventTypes.GameFinished: {
          console.log(`Event received: ${GameEventTypes.GameFinished}`);
          const roomId = message.value.base_values.room?.id;
          if (roomId) {
            broadcastToAllInRoom(roomId, message);
          }
          break;
        }

        case GameEventTypes.CubeMoved: {
          console.log(`Event received: ${GameEventTypes.CubeMoved}`, message.value);
          const roomId = message.value.base_values.room?.id;
          if (roomId) {
            broadcastToAllInRoom(roomId, message);
          }
          break;
        }

        case GameEventTypes.KeyBoardButtonPressed: {
          console.log("Keyboard button pressed: ", message.value);
          const roomId = message.value.room?.id;
          
          if (!roomId) {
            console.error('No room_id in keyboard button pressed message');
            return;
          }
          const updated_cube_state = applyMove(message.value.player.scrambledCube, { face: message.value.keyboardButton, clockwise: true })
          message.value.player.scrambledCube = updated_cube_state;
          // TODO: update in redis as well.

          const all_players_of_room = rooms.get(roomId);
          
          if (!all_players_of_room) {
            console.error(`Room ${roomId} not found`);
            return;
          }

          // Convert Map to array of player info for broadcasting
          const playersArray = Array.from(all_players_of_room.players.values()).map(pc => ({
            player_id: pc.player_id,
            player: pc.player
          }));

          const keyboard_message = {
            type: GameEventTypes.KeyBoardButtonPressed,
            value: {
              room: message.value.room,
              player: message.value.player,
              keyboardButton: message.value.keyboardButton,
              players: playersArray
            }
          };
          
          broadcastToAllInRoom(roomId, keyboard_message);
          break;
        }

        default: {
          console.log('Unknown event type:', message.type);
          ws.send(JSON.stringify({ 
            type: GameEventTypes.Error, 
            error: 'Unknown event type', 
            received: message 
          }));
          break;
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(
        JSON.stringify({
          type: GameEventTypes.Error,
          error: 'Invalid message format',
          details: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    
    // Remove player from room
    const playerInfo = wsToPlayer.get(ws);
    if (playerInfo) {
      const { room_id, player_id } = playerInfo;
      const roomData = rooms.get(room_id);
      if (roomData) {
        roomData.players.delete(player_id);
        console.log(`Player ${player_id} removed from room ${room_id}`);
        
        if (roomData.players.size === 0) {
          rooms.delete(room_id);
          console.log(`Room ${room_id} deleted (no players left)`);
        }
      }
      wsToPlayer.delete(ws);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Closing WebSocket server...');
  wss.close(() => {
    server.close(() => {
      console.log('WebSocket and HTTP servers closed. Exiting process.');
      process.exit(0);
    });
  });
});

server.listen(websocket_port, () => {
  console.log(`WebSocket server listening on ${websocket_url}`);
});