import { WebSocket } from 'ws';
import http from 'http';
import { GameEvents, GameEventTypes } from '@/types/game-events';

// Note: Tests assume the server is running at ws://localhost:8002 as per server default.

const WS_PORT = 8002;
const WS_URL = `ws://localhost:${WS_PORT}`;

function waitForOpen(ws: WebSocket) {
  return new Promise<void>((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) {
      resolve();
    } else {
      ws.on('open', () => resolve());
    }
    ws.on('error', (err) => reject(err));
  });
}

function waitForMessage(ws: WebSocket): Promise<any> {
  return new Promise((resolve) => {
    ws.once('message', (data) => {
      resolve(data.toString());
    });
  });
}

describe('WebSocket Server', () => {
  let ws: WebSocket;

  afterEach((done) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
      ws.once('close', () => done());
    } else {
      done();
    }
  });

  it('can connect to the WebSocket server', async () => {
    ws = new WebSocket(WS_URL);
    await expect(waitForOpen(ws)).resolves.toBeUndefined();
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it('can send a JSON message to the server without crash', async () => {
    ws = new WebSocket(WS_URL);
    await waitForOpen(ws);

    // You may customize message type to test
    const testMessage = {
      type: GameEventTypes.GameStarted,
      value: {
        base_values: {
          room: undefined,
          participants: [undefined, undefined]
        },
        // Remove websocket_conn since it cannot be cloned/serialized over ws, nor is it expected structure for a message.
        start_time: new Date().toISOString()
      }
    };

    // The server currently just logs and does not reply.
    // We test that no error event is emitted and connection stays open for a brief time.
    ws.send(JSON.stringify(testMessage));

    // Wait a bit to make sure server processes it
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it('closes connection cleanly', async () => {
    ws = new WebSocket(WS_URL);
    await waitForOpen(ws);

    ws.close();
    await new Promise<void>((resolve) => ws.once('close', () => resolve()));

    expect(ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING).toBeTruthy();
  });
});

