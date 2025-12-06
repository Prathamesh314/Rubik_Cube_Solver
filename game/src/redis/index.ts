import type { Player, CubeCategories } from '@/modals/player';
import type { Room } from '@/modals/room';
import { RedisClient } from './client';
import { PlayerService } from './services/player-service';
import { RoomService } from './services/room-service';
import { MatchmakingService } from './services/matchmaking-service';
import { LockService } from './services/lock-service';
import type { MatchmakingResult, FriendMatchResult } from './types';

export class Redis {
    private static instance: Redis;

    private redisClient: RedisClient;
    private playerService?: PlayerService;
    private roomService?: RoomService;
    private matchmakingService?: MatchmakingService;
    private lockService?: LockService;

    private constructor() {
        this.redisClient = new RedisClient();
    }

    public static getInstance(): Redis {
        if (!Redis.instance) {
            Redis.instance = new Redis();
        }
        return Redis.instance;
    }

    async connect(): Promise<void> {
        await this.redisClient.connect();
        this.initializeServices();
    }

    private initializeServices(): void {
        const client = this.redisClient.getClient();

        this.playerService = new PlayerService(client);
        this.roomService = new RoomService(client);
        this.lockService = new LockService(client);
        this.matchmakingService = new MatchmakingService(
            this.playerService,
            this.roomService,
            this.lockService
        );
    }

    async disconnect(): Promise<void> {
        await this.redisClient.disconnect();
    }

    isConnected(): boolean {
        return this.redisClient.isClientConnected();
    }

    async ping(): Promise<boolean> {
        return await this.redisClient.ping();
    }

    private ensureConnected(): void {
        if (!this.isConnected()) {
            throw new Error('Redis is not connected. Call connect() first.');
        }
    }

    private getPlayerService(): PlayerService {
        this.ensureConnected();
        if (!this.playerService) {
            throw new Error('PlayerService not initialized');
        }
        return this.playerService;
    }

    private getRoomService(): RoomService {
        this.ensureConnected();
        if (!this.roomService) {
            throw new Error('RoomService not initialized');
        }
        return this.roomService;
    }

    private getMatchmakingService(): MatchmakingService {
        this.ensureConnected();
        if (!this.matchmakingService) {
            throw new Error('MatchmakingService not initialized');
        }
        return this.matchmakingService;
    }

    async insertPlayer(player: Player): Promise<boolean> {
        return await this.getPlayerService().insertPlayer(player);
    }

    async upsertPlayer(playerId: string, player: Player): Promise<void> {
        return await this.getPlayerService().upsertPlayer(playerId, player);
    }

    async getPlayer(playerId: string): Promise<Player | null> {
        return await this.getPlayerService().getPlayer(playerId);
    }

    async getAllPlayers(variant?: CubeCategories): Promise<Player[]> {
        return await this.getPlayerService().getAllPlayers(variant);
    }

    async getWaitingPlayers(): Promise<Player[]> {
        return await this.getPlayerService().getWaitingPlayers();
    }

    async deletePlayer(playerId: string): Promise<boolean> {
        return await this.getPlayerService().deletePlayer(playerId);
    }

    async deleteAllPlayers(): Promise<boolean> {
        return await this.getPlayerService().deleteAllPlayers();
    }

    async hasPlayers(): Promise<boolean> {
        return await this.getPlayerService().hasPlayers();
    }

    async updatePlayerCube(playerId: string, cube: number[][][]): Promise<void> {
        return await this.getPlayerService().updatePlayerCube(playerId, cube);
    }

    async insertRoom(room: Room): Promise<void> {
        return await this.getRoomService().insertRoom(room);
    }

    async upsertRoom(roomId: string, room: Room): Promise<void> {
        return await this.getRoomService().upsertRoom(roomId, room);
    }

    async getRoom(roomId: string | null): Promise<Room | null> {
        return await this.getRoomService().getRoom(roomId);
    }

    async getAllRooms(): Promise<Room[]> {
        return await this.getRoomService().getAllRooms();
    }

    async deleteRoom(roomId: string | null): Promise<boolean> {
        return await this.getRoomService().deleteRoom(roomId);
    }

    async deleteAllRooms(): Promise<boolean> {
        return await this.getRoomService().deleteAllRooms();
    }

    async setPlayerRoom(playerId: string, roomId: string): Promise<void> {
        return await this.getRoomService().setPlayerRoom(playerId, roomId);
    }

    async getPlayerRoom(playerId: string): Promise<string | null> {
        return await this.getRoomService().getPlayerRoom(playerId);
    }

    async removePlayerFromRoom(playerId: string, roomId: string | null): Promise<boolean> {
        return await this.getRoomService().removePlayerFromRoom(playerId, roomId);
    }

    async clearPlayerRoomMappings(): Promise<void> {
        return await this.getRoomService().clearPlayerRoomMappings();
    }

    async tryMatchOrEnqueue(player: Player, variant: CubeCategories): Promise<MatchmakingResult> {
        return await this.getMatchmakingService().tryMatchOrEnqueue(player, variant);
    }

    async startFriendMatch(player: Player, variant: CubeCategories, isOpponentReady: boolean, opponentPlayerId?: string): Promise<FriendMatchResult> {
        return await this.getMatchmakingService().startFriendMatch(
            player,
            variant,
            isOpponentReady,
            opponentPlayerId
        );
    }
}

// Export singleton getter
export const getRedis = () => Redis.getInstance();