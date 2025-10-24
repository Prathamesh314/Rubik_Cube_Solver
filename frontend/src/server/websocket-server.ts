// server-only module: do NOT import this from React components
import 'dotenv/config';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws'; // import both for types/constants
import { WEBSOCKET_PORT, NEXT_PUBLIC_WEBSOCKET_URL } from '@/lib/env_config';
import type { Room } from '@/modals/room';
import type { Player, THREE_SIDE_CUBE_MOVES } from '@/modals/player';

const websocket_port = WEBSOCKET_PORT ?? 8002;
const websocket_url = NEXT_PUBLIC_WEBSOCKET_URL ?? 'ws://localhost:8002';

export enum GameEventTypes {
  GameStarted = 'GameStarted',
  GameFinished = 'GameFinished',
  CubeMoved = 'CubeMoved',
}

export interface BaseMessageValues {
  room: Room | undefined;
  participants: Array<Player | undefined>;
}

export interface GameStartEventMessageValues {
  base_values: BaseMessageValues;
  scrambled_cube: number[][][];
  start_time: string;
}

export interface GameEndEventMessageValues {
  base_values: BaseMessageValues;
  end_time: string;
}

export interface CubeMovedEventMessageValues {
  base_values: BaseMessageValues;
  move: keyof typeof THREE_SIDE_CUBE_MOVES;
}

export type GameEvents =
  | { type: GameEventTypes.GameStarted; value: GameStartEventMessageValues }
  | { type: GameEventTypes.GameFinished; value: GameEndEventMessageValues }
  | { type: GameEventTypes.CubeMoved; value: CubeMovedEventMessageValues };

// Store active rooms and their connections
interface RoomConnections {
  players: Map<string, WebSocket>; // player_id -> WebSocket (from 'ws')
  scrambledMoves?: number[][][];
  startTime?: string;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });

const rooms = new Map<string, RoomConnections>();

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (rawMessage) => {
    try {
      const message: GameEvents = JSON.parse(rawMessage.toString());
      console.log('Received message:', message);

      switch (message.type) {
        case GameEventTypes.GameStarted: {
          console.log(`Event received: ${GameEventTypes.GameStarted}`);
          const roomId = message.value.base_values.room?.id;
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

          message.value.base_values.participants.forEach((player) => {
            if (player?.player_id) {
              roomData!.players.set(player.player_id, ws);
            }
          });

          const gameStartMessage: GameEvents = {
            type: GameEventTypes.GameStarted,
            value: {
              base_values: message.value.base_values,
              scrambled_cube: roomData.scrambledMoves!,
              start_time: roomData.startTime!,
            },
          };

          roomData.players.forEach((playerWs) => {
            if (playerWs.readyState === WebSocket.OPEN) {
              playerWs.send(JSON.stringify(gameStartMessage));
            }
          });
          break;
        }

        case GameEventTypes.GameFinished: {
          console.log(`Event received: ${GameEventTypes.GameFinished}`);
          ws.send(
            JSON.stringify({
              ack: true,
              type: message.type,
              message: 'Game finished event received',
            }),
          );
          break;
        }

        case GameEventTypes.CubeMoved: {
          console.log(`Event received: ${GameEventTypes.CubeMoved}`, message.value);
          ws.send(
            JSON.stringify({
              ack: true,
              type: message.type,
              message: 'Cube moved event received',
              participants: message.value.base_values.participants,
            }),
          );
          break;
        }

        default: {
          console.log('Unknown event type:', message);
          ws.send(JSON.stringify({ error: 'Unknown event type', received: message }));
          break;
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(
        JSON.stringify({
          error: 'Invalid message format',
          details: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
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
  console.log(`WebSocket server listening on ${websocket_url}`);
});
