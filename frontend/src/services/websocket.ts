// server.ts
import { WebSocketServer } from 'ws';
import http from 'http';
import { EnvConfig } from '@/lib/env_config';

const websocket_port = parseInt(EnvConfig.WEBSOCKET_PORT ?? '8002');
const websocket_url = EnvConfig.WEBSOCKET_URL ?? "localhost:8002";
const server = http.createServer();
const wss = new WebSocketServer({ server });

enum GameEventTypes {
  GameStarted = "GameStarted",
  GameFinished = "GameFinished",
  CubeMoved = "CubeMoved"
}

interface CubeMessageValues {
  participants: Array<string>;
}

type GameEvents =
  | { type: GameEventTypes.GameStarted; value: string }
  | { type: GameEventTypes.GameFinished; value: string }
  | { type: GameEventTypes.CubeMoved; value: CubeMessageValues };

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (rawMessage) => {
    try {
      // Parse the incoming message (it comes as Buffer/string)
      const message: GameEvents = JSON.parse(rawMessage.toString());
      
      console.log('Received message:', message);

      switch (message.type) {
        case GameEventTypes.GameStarted:
          console.log(`Event received: ${GameEventTypes.GameStarted} with Value: ${message.value}`);
          // Send acknowledgment back to client
          ws.send(JSON.stringify({ 
            ack: true, 
            type: message.type, 
            message: 'Game started event received' 
          }));
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
            participants: message.value.participants 
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