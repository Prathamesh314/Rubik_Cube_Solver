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

  it('should handle GameStarted event and receive broadcasted game start message', (done) => {
    // For this test, we emulate a minimal GameStarted event payload expected by backend
    const roomId = "test-room-1-" + Math.floor(Math.random() * 100000);
    const fakePlayerA = { player_id: "a1", username: "Alice", rating: 1500 };
    const fakePlayerB = { player_id: "b2", username: "Bob", rating: 1480 };
    const event = {
      type: GameEventTypes.GameStarted,
      value: {
        base_values: {
          room: { id: roomId, players: [fakePlayerA, fakePlayerB], maxPlayers: 2, gameState: null, variant: "3x3", createdAt: Date.now() },
          participants: [fakePlayerA, fakePlayerB]
        },
        scrambled_cube: ["LEFT", "RIGHT", "TOP"], // minimal scramble
        start_time: new Date().toISOString()
      }
    };

    const messageHandler = (data: Buffer) => {
      const response = JSON.parse(data.toString());
      console.log("📨 Received response:", response);

      // The server should echo a GameStarted message with full event shape
      expect(response.type).toBe(GameEventTypes.GameStarted);
      expect(response.value).toBeDefined();
      expect(response.value.base_values).toBeDefined();
      expect(response.value.base_values.room.id).toBe(roomId);
      expect(Array.isArray(response.value.scrambled_cube)).toBe(true);
      expect(typeof response.value.start_time).toBe("string");
      // Participants should match
      expect(Array.isArray(response.value.base_values.participants)).toBe(true);
      expect(
        response.value.base_values.participants.map((p: any) => p.player_id).sort()
      ).toEqual(
        [fakePlayerA.player_id, fakePlayerB.player_id].sort()
      );

      ws.off('message', messageHandler);
      done();
    };

    ws.on('message', messageHandler);

    console.log('📤 Sending GameStarted event');
    ws.send(JSON.stringify(event));
  }, 10000);

  // it('should handle GameFinished event and receive acknowledgment', (done) => {
  //   const event: GameEvents = {
  //     type: GameEventTypes.GameFinished,
  //     value: 'Test game finished!'
  //   };

  //   const messageHandler = (data: Buffer) => {
  //     const response: AckResponse = JSON.parse(data.toString());
  //     console.log('📨 Received response:', response);
      
  //     expect(response.ack).toBe(true);
  //     expect(response.type).toBe(GameEventTypes.GameFinished);
  //     expect(response.message).toBe('Game finished event received');
      
  //     ws.off('message', messageHandler);
  //     done();
  //   };

  //   ws.on('message', messageHandler);
    
  //   console.log('📤 Sending GameFinished event');
  //   ws.send(JSON.stringify(event));
  // }, 10000);

  // it('should handle CubeMoved event with participants and receive acknowledgment', (done) => {
  //   const event: GameEvents = {
  //     type: GameEventTypes.CubeMoved,
  //     value: { participants: ['alice', 'bob'] }
  //   };

  //   const messageHandler = (data: Buffer) => {
  //     const response: AckResponse = JSON.parse(data.toString());
  //     console.log('📨 Received response:', response);
      
  //     expect(response.ack).toBe(true);
  //     expect(response.type).toBe(GameEventTypes.CubeMoved);
  //     expect(response.message).toBe('Cube moved event received');
  //     expect(response.participants).toEqual(['alice', 'bob']);
      
  //     ws.off('message', messageHandler);
  //     done();
  //   };

  //   ws.on('message', messageHandler);
    
  //   console.log('📤 Sending CubeMoved event');
  //   ws.send(JSON.stringify(event));
  // }, 10000);
});