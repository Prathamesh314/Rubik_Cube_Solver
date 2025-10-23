// server.ts
import { WebSocketServer } from 'ws';
import http from 'http';
import { WEBSOCKET_PORT, NEXT_PUBLIC_WEBSOCKET_URL } from '@/lib/env_config';
import { Room } from '@/modals/room';
import { Player, THREE_SIDE_CUBE_MOVES } from '@/modals/player';
import { Game } from './game';

const websocket_port = WEBSOCKET_PORT ?? 8002;
const websocket_url = NEXT_PUBLIC_WEBSOCKET_URL ?? "localhost:8002";

const server = http.createServer();
const wss = new WebSocketServer({ server });

export enum GameEventTypes {
  GameStarted = "GameStarted",
  GameFinished = "GameFinished",
  CubeMoved = "CubeMoved"
}

export interface BaseMessageValues {
  room: Room | undefined
  participants: Array<Player | undefined>
}

export interface GameStartEventMessageValues{
  base_values: BaseMessageValues
  scrambled_cube: number[][][]
  start_time: string
}

export interface GameEndEventMessageValues {
  base_values: BaseMessageValues
  end_time: string
}

export interface CubeMovedEventMessageValues {
  base_values: BaseMessageValues
  move: keyof typeof THREE_SIDE_CUBE_MOVES
}

export type GameEvents =
  | { type: GameEventTypes.GameStarted; value: GameStartEventMessageValues }
  | { type: GameEventTypes.GameFinished; value: GameEndEventMessageValues }
  | { type: GameEventTypes.CubeMoved; value: CubeMovedEventMessageValues };

// Store active rooms and their connections
interface RoomConnections {
  players: Map<string, WebSocket>;  // player_id -> WebSocket
  scrambledMoves?: number[][][];
  startTime?: string;
}

const rooms = new Map<string, RoomConnections>();

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (rawMessage) => {
    try {
      // Parse the incoming message (it comes as Buffer/string)
      const message: GameEvents = JSON.parse(rawMessage.toString());
      console.log('Received message:', message);
      let currentPlayerId: string | undefined;
      let currentRoomId: string | undefined;

      switch (message.type) {
        case GameEventTypes.GameStarted:
          console.log(`Event received: ${GameEventTypes.GameStarted} with Value: ${message.value}`);
          // Send acknowledgment back to client
          const roomId = message.value.base_values.room?.id;
          console.log("Room: ", message.value.base_values.room)
          console.log("Participants: ", message.value.base_values.participants)
          if (!roomId) {
            ws.send(JSON.stringify({ error: 'No room ID provided' }));
            return;
          }

          let roomData = rooms.get(roomId);
          if (!roomData) {
            roomData = {
              players: new Map(),
              scrambledMoves: message.value.scrambled_cube ?? [[[]]],
              startTime: message.value.start_time ?? new Date().toISOString(),
            };
            rooms.set(roomId, roomData);
          }

          currentRoomId = roomId;
          message.value.base_values.participants.forEach(player => {
            if (player?.player_id) {
              roomData!.players.set(player.player_id, ws as any);
              Game.getInstance().then((game) => {
                // You can use 'game' here if needed
              });
            }
          });

          // Broadcast game start to ALL players in room
          const gameStartMessage: GameEvents = {
            type: GameEventTypes.GameStarted,
            value: {
              base_values: message.value.base_values,
              scrambled_cube: roomData.scrambledMoves!,
              start_time: roomData.startTime!
            }
          };

          roomData.players.forEach((playerWs) => {
            if (playerWs.readyState === WebSocket.OPEN) {
              playerWs.send(JSON.stringify(gameStartMessage));
            }
          });
          break;

        case GameEventTypes.GameFinished:
          console.log(`Event received: ${GameEventTypes.GameFinished} with Value: ${message.value}`);
          ws.send(JSON.stringify({ 
            ack: true, 
            type: message.type, 
            message: 'Game finished event received' 
          }));
          break;

        case GameEventTypes.CubeMoved:
          console.log(`Event received: ${GameEventTypes.CubeMoved} with Value:`, message.value);
          ws.send(JSON.stringify({ 
            ack: true, 
            type: message.type, 
            message: 'Cube moved event received',
            participants: message.value.base_values.participants 
          }));
          break;

        default:
          console.log('Unknown event type:', message);
          ws.send(JSON.stringify({ 
            error: 'Unknown event type',
            received: message 
          }));
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({ 
        error: 'Invalid message format',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
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
  console.log(`WebSocket server listening on ws://${websocket_url}`);
});

export { wss, server };