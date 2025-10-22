// server.test.ts
import WebSocket from 'ws';

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

interface AckResponse {
  ack: boolean;
  type: GameEventTypes;
  message: string;
  participants?: string[];
}

describe('WebSocket GameEvents integration test', () => {
  let ws: WebSocket;
  const WS_URL = 'ws://localhost:8002';

  beforeAll((done) => {
    ws = new WebSocket(WS_URL);
    ws.on('open', () => {
      console.log('✅ Test client connected');
      done();
    });
    ws.on('error', (err) => {
      console.error('❌ Connection error:', err);
      done(err);
    });
  });

  afterAll((done) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
      ws.on('close', () => {
        console.log('👋 Test client disconnected');
        done();
      });
    } else {
      done();
    }
  });

  it('should handle GameStarted event and receive acknowledgment', (done) => {
    const event: GameEvents = {
      type: GameEventTypes.GameStarted,
      value: 'Test game started!'
    };

    // Listen for response from server
    const messageHandler = (data: Buffer) => {
      const response: AckResponse = JSON.parse(data.toString());
      console.log('📨 Received response:', response);
      
      expect(response.ack).toBe(true);
      expect(response.type).toBe(GameEventTypes.GameStarted);
      expect(response.message).toBe('Game started event received');
      
      ws.off('message', messageHandler);
      done();
    };

    ws.on('message', messageHandler);
    
    // Send the event
    console.log('📤 Sending GameStarted event');
    ws.send(JSON.stringify(event));
  }, 10000);

  it('should handle GameFinished event and receive acknowledgment', (done) => {
    const event: GameEvents = {
      type: GameEventTypes.GameFinished,
      value: 'Test game finished!'
    };

    const messageHandler = (data: Buffer) => {
      const response: AckResponse = JSON.parse(data.toString());
      console.log('📨 Received response:', response);
      
      expect(response.ack).toBe(true);
      expect(response.type).toBe(GameEventTypes.GameFinished);
      expect(response.message).toBe('Game finished event received');
      
      ws.off('message', messageHandler);
      done();
    };

    ws.on('message', messageHandler);
    
    console.log('📤 Sending GameFinished event');
    ws.send(JSON.stringify(event));
  }, 10000);

  it('should handle CubeMoved event with participants and receive acknowledgment', (done) => {
    const event: GameEvents = {
      type: GameEventTypes.CubeMoved,
      value: { participants: ['alice', 'bob'] }
    };

    const messageHandler = (data: Buffer) => {
      const response: AckResponse = JSON.parse(data.toString());
      console.log('📨 Received response:', response);
      
      expect(response.ack).toBe(true);
      expect(response.type).toBe(GameEventTypes.CubeMoved);
      expect(response.message).toBe('Cube moved event received');
      expect(response.participants).toEqual(['alice', 'bob']);
      
      ws.off('message', messageHandler);
      done();
    };

    ws.on('message', messageHandler);
    
    console.log('📤 Sending CubeMoved event');
    ws.send(JSON.stringify(event));
  }, 10000);

  it('should handle unknown event type', (done) => {
    const event = {
      type: 'UnknownEvent',
      value: 'test'
    };

    const messageHandler = (data: Buffer) => {
      const response = JSON.parse(data.toString());
      console.log('📨 Received error response:', response);
      
      expect(response.error).toBe('Unknown event type');
      
      ws.off('message', messageHandler);
      done();
    };

    ws.on('message', messageHandler);
    
    console.log('📤 Sending unknown event type');
    ws.send(JSON.stringify(event));
  }, 10000);
});