import 'dotenv/config';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GameEventTypes, GameEventsSchema, type GameEvents } from '@/types/game-events';
import { WEBSOCKET_PORT, WEBSOCKET_URL } from './constants';
import type { GameServerState } from './types';

import { RoomService } from './services/room-service';
import { BroadcastService } from './services/broadcast-service';
import { DatabaseService } from './services/database-service';

import { GameHandlers } from './handlers/game-handlers';
import { PlayerHandlers } from './handlers/player-handlers';
import { FriendHandlers } from './handlers/friend-handlers';

export class GameServer {
    private static instance: GameServer;
    
    private server: http.Server;
    private wss: WebSocketServer;
    private state: GameServerState;

    private roomService: RoomService;
    private broadcastService: BroadcastService;
    private databaseService: DatabaseService;

    private gameHandlers: GameHandlers;
    private playerHandlers: PlayerHandlers;
    private friendHandlers: FriendHandlers;

    private constructor() {
        this.server = http.createServer();
        this.wss = new WebSocketServer({ server: this.server });
        
        this.state = {
            rooms: new Map(),
            onlinePlayers: new Map()
        };

        this.roomService = new RoomService(this.state);
        this.broadcastService = new BroadcastService(this.state);
        this.databaseService = new DatabaseService();

        this.gameHandlers = new GameHandlers(
            this.roomService,
            this.broadcastService,
            this.databaseService
        );
        this.playerHandlers = new PlayerHandlers(
            this.state,
            this.broadcastService
        );
        this.friendHandlers = new FriendHandlers(
            this.state,
            this.broadcastService,
            this.roomService
        );

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
        this.server.listen(WEBSOCKET_PORT, () => {
            console.log(`✅ WebSocket server listening on ${WEBSOCKET_URL}`);
        });
    }

    private setupListeners(): void {
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('🔌 Client connected');

            ws.on('message', (rawMessage: Buffer | string) => {
                this.handleMessage(ws, rawMessage);
            });

            ws.on('close', () => {
                this.playerHandlers.handlePlayerDisconnect(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.playerHandlers.handlePlayerDisconnect(ws);
            });
        });
    }

    private handleMessage(ws: WebSocket, rawMessage: string | Buffer): void {
        try {
            const rawData = JSON.parse(rawMessage.toString());
            const parseResult = GameEventsSchema.safeParse(rawData);
            
            if (!parseResult.success) {
                console.error('Invalid message format:', parseResult.error);
                this.broadcastService.sendError(ws, 'Invalid message format');
                return;
            }
            
            const message = parseResult.data;
            this.routeMessage(ws, message);
            
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error processing message: ${error.message}`);
            } else {
                console.error('Unknown error processing message:', error);
            }
        }
    }

    private routeMessage(ws: WebSocket, message: GameEvents): void {
        switch (message.type) {
            case GameEventTypes.GameStarted:
                this.gameHandlers.handleGameStarted(ws, message.value);
                break;
            
            case GameEventTypes.GameStartedAI:
                this.gameHandlers.handleGameStartedAI(ws, message.value);
                break;
            
            case GameEventTypes.KeyBoardButtonPressed:
                this.gameHandlers.handleKeyboardButtonPressed(ws, message.value);
                break;
            
            case GameEventTypes.GameFinished:
                this.gameHandlers.handleGameFinished(ws, message.value);
                break;
            
            case GameEventTypes.PlayerOnline:
                this.playerHandlers.handlePlayerOnline(ws, message.value);
                break;
            
            case GameEventTypes.PlayerOffline:
                this.playerHandlers.handlePlayerOffline(message.value);
                break;
            
            case GameEventTypes.FriendChallenge:
                this.friendHandlers.handleFriendChallenge(message.value);
                break;
            
            case GameEventTypes.SendFriendRequest:
                this.friendHandlers.handleSendFriendRequest(message.value);
                break;
            
            case GameEventTypes.FriendChallengeRejected:
                this.friendHandlers.handleFriendChallengeRejected(message.value);
                break;
            
            default:
                console.warn(`Unknown message type`);
        }
    }

    private setupGracefulShutdown(): void {
        const shutdown = () => {
            console.log('\nShutdown signal received. Closing WebSocket server...');
            
            this.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.close(1000, 'Server shutting down');
                }
            });

            this.wss.close(() => {
                this.server.close(() => {
                    console.log('WebSocket and HTTP servers closed. Exiting process.');
                    process.exit(0);
                });
            });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }

    public getRoomService(): RoomService {
        return this.roomService;
    }

    public getBroadcastService(): BroadcastService {
        return this.broadcastService;
    }

    public getOnlinePlayers(): string[] {
        return this.playerHandlers.getOnlinePlayers();
    }
}

export const getGameServer = () => GameServer.getInstance();