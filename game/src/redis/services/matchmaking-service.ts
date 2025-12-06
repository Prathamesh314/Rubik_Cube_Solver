import { randomUUID } from 'crypto';
import type { Player, CubeCategories } from '@/modals/player';
import { PlayerState } from '@/modals/player';
import type { Room } from '@/modals/room';
import { generateScrambledCube } from '@/utils/cube_helper';
import { PlayerService } from './player-service';
import { RoomService } from './room-service';
import { LockService } from './lock-service';
import { RedisConfig } from '../config';
import type { MatchmakingResult, FriendMatchResult } from '../types';

export class MatchmakingService {
    constructor(
        private readonly playerService: PlayerService,
        private readonly roomService: RoomService,
        private readonly lockService: LockService
    ) {}

    async tryMatchOrEnqueue(
        player: Player,
        variant: CubeCategories
    ): Promise<MatchmakingResult> {
        return await this.lockService.withLock(
            RedisConfig.KEYS.MATCHMAKING_LOCK,
            async () => {
                return await this.matchOrEnqueueHelper(player, variant);
            }
        );
    }

    private async matchOrEnqueueHelper(
        player: Player,
        variant: CubeCategories
    ): Promise<MatchmakingResult> {
        const opponentPlayerId = await this.playerService.getNextWaitingPlayer();

        if (!opponentPlayerId) {
            return await this.enqueuePlayer(player, variant);
        }

        return await this.createMatch(player, opponentPlayerId, variant);
    }

    private async enqueuePlayer(
        player: Player,
        variant: CubeCategories
    ): Promise<MatchmakingResult> {
        const roomId = randomUUID();
        const scrambledCube = generateScrambledCube().state;

        player.updateCube(scrambledCube);
        player.player_state = PlayerState.Waiting;

        await this.playerService.upsertPlayer(player.player_id, player);
        
        await this.playerService.addToWaitingList(player.player_id);

        // Create room
        const room: Room = {
            id: roomId,
            players: [player],
            maxPlayers: 2,
            gameState: { status: 'init' },
            initialState: scrambledCube,
            variant,
            createdAt: Date.now(),
        };

        await this.roomService.insertRoom(room);
        await this.roomService.setPlayerRoom(player.player_id, roomId);

        console.log(`Player ${player.player_id} enqueued in room ${roomId}`);

        return { queued: true, room };
    }

    private async createMatch(
        player: Player,
        opponentPlayerId: string,
        variant: CubeCategories
    ): Promise<MatchmakingResult> {
        const opponent = await this.playerService.getPlayer(opponentPlayerId);

        if (!opponent) {
            throw new Error(`Opponent player not found: ${opponentPlayerId}`);
        }

        player.updateCube(opponent.scrambledCube);
        player.player_state = PlayerState.Playing;
        await this.playerService.upsertPlayer(player.player_id, player);

        opponent.player_state = PlayerState.Playing;
        opponent.player_state = PlayerState.Playing;
        await this.playerService.upsertPlayer(opponent.player_id, opponent);

        // Get opponent's room
        const roomId = await this.roomService.getPlayerRoom(opponent.player_id);
        if (!roomId) {
            throw new Error(`Room not found for opponent: ${opponent.player_id}`);
        }

        // Add player to room
        await this.roomService.setPlayerRoom(player.player_id, roomId);
        const room = await this.roomService.getRoom(roomId);

        if (!room) {
            throw new Error(`Room data not found: ${roomId}`);
        }

        // Add player to room if not already present
        if (room.players.length < 2) {
            room.players.push(player);
            await this.roomService.upsertRoom(roomId, room);
        }

        console.log(`Match created: ${player.player_id} vs ${opponent.player_id} in room ${roomId}`);

        return { queued: false, room };
    }

    async startFriendMatch(
        player: Player,
        variant: CubeCategories,
        isOpponentReady: boolean,
        opponentPlayerId?: string
    ): Promise<FriendMatchResult> {
        return await this.lockService.withLock(
            RedisConfig.KEYS.MATCHMAKING_LOCK,
            async () => {
                return await this.startFriendMatchHelper(
                    player,
                    variant,
                    isOpponentReady,
                    opponentPlayerId
                );
            }
        );
    }

    private async startFriendMatchHelper(
        player: Player,
        variant: CubeCategories,
        isOpponentReady: boolean,
        opponentPlayerId?: string
    ): Promise<FriendMatchResult> {
        // Opponent is ready - join their room
        if (isOpponentReady) {
            if (!opponentPlayerId) {
                throw new Error('Opponent player ID required when opponent is ready');
            }

            return await this.joinFriendRoom(player, opponentPlayerId);
        }

        // Opponent not ready - create new room
        return await this.createFriendRoom(player, variant);
    }

    private async joinFriendRoom(
        player: Player,
        opponentPlayerId: string
    ): Promise<FriendMatchResult> {
        const roomId = await this.roomService.getPlayerRoom(opponentPlayerId);
        const room = await this.roomService.getRoom(roomId);

        if (!roomId || !room) {
            throw new Error(`Room not found for opponent: ${opponentPlayerId}`);
        }

        // Update player state
        player.updateCube(room.initialState);
        player.player_state = PlayerState.Playing;

        // Add player to room
        room.players.push(player);

        // Save updates
        await this.playerService.upsertPlayer(player.player_id, player);
        await this.roomService.upsertRoom(roomId, room);
        await this.roomService.setPlayerRoom(player.player_id, roomId);

        console.log(`Player ${player.player_id} joined friend room ${roomId}`);

        return { roomId, isGameStarted: true };
    }

    private async createFriendRoom(
        player: Player,
        variant: CubeCategories
    ): Promise<FriendMatchResult> {
        const roomId = randomUUID();
        const scrambledCube = generateScrambledCube().state;

        // Update player state
        player.updateCube(scrambledCube);
        player.player_state = PlayerState.Playing;

        // Create room
        const room: Room = {
            id: roomId,
            players: [player],
            maxPlayers: 2,
            gameState: { status: 'init' },
            initialState: scrambledCube,
            variant,
            createdAt: Date.now(),
        };

        // Save room, player, and mapping
        await this.roomService.upsertRoom(roomId, room);
        await this.playerService.upsertPlayer(player.player_id, player);
        await this.roomService.setPlayerRoom(player.player_id, roomId);

        console.log(`Friend room created: ${roomId} by player ${player.player_id}`);

        return { roomId, isGameStarted: false };
    }
}