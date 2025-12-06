import type { RedisClientType } from 'redis';
import { Player, PlayerState, type CubeCategories } from '@/modals/player';
import { RedisConfig, getWaitingKey } from '../config';

export class PlayerService {
    constructor(private readonly client: RedisClientType) {}

    async insertPlayer(player: Player): Promise<boolean> {
        const field = player.player_id;
        const value = JSON.stringify(Player.toPlain(player));

        const inserted = await this.client.hSetNX(
            RedisConfig.KEYS.PLAYERS,
            field,
            value
        );
        
        return inserted === 1;
    }

    async upsertPlayer(playerId: string, player: Player): Promise<void> {
        const value = JSON.stringify(Player.toPlain(player));
        await this.client.hSet(RedisConfig.KEYS.PLAYERS, playerId, value);
    }

    async getPlayer(playerId: string): Promise<Player | null> {
        const raw = await this.client.hGet(RedisConfig.KEYS.PLAYERS, playerId);
        if (!raw) return null;
        
        return Player.fromPlain(JSON.parse(raw));
    }

    async getAllPlayers(variant?: CubeCategories): Promise<Player[]> {
        const keyToUse = variant 
            ? getWaitingKey(variant) 
            : RedisConfig.KEYS.PLAYERS;

        const all = await this.client.hGetAll(keyToUse);
        
        if (!all || Object.keys(all).length === 0) {
            return [];
        }

        return Object.values(all).map((v) => Player.fromPlain(JSON.parse(v)));
    }

    async getWaitingPlayers(): Promise<Player[]> {
        const all = await this.client.hGetAll(RedisConfig.KEYS.PLAYERS);
        
        if (!all || Object.keys(all).length === 0) {
            return [];
        }

        return Object.values(all)
            .map((v) => Player.fromPlain(JSON.parse(v)))
            .filter((p) => p.player_state === PlayerState.Waiting);
    }

    async deletePlayer(playerId: string): Promise<boolean> {
        const result = await this.client.hDel(RedisConfig.KEYS.PLAYERS, playerId);
        return result > 0;
    }

    async deleteAllPlayers(): Promise<boolean> {
        const result = await this.client.del(RedisConfig.KEYS.PLAYERS);
        return result > 0;
    }

    async hasPlayers(): Promise<boolean> {
        const count = await this.client.hLen(RedisConfig.KEYS.PLAYERS);
        return count > 0;
    }

    async updatePlayerCube(playerId: string, cube: number[][][]): Promise<void> {
        const player = await this.getPlayer(playerId);
        
        if (!player) {
            throw new Error(`Player not found: ${playerId}`);
        }

        player.scrambledCube = cube;
        await this.upsertPlayer(playerId, player);
    }

    async addToWaitingList(playerId: string): Promise<void> {
        await this.client.lPush(RedisConfig.KEYS.WAITING_LIST, playerId);
    }

    async getNextWaitingPlayer(): Promise<string | null> {
        return await this.client.lPop(RedisConfig.KEYS.WAITING_LIST);
    }

    async removeFromWaitingList(playerId: string): Promise<number> {
        return await this.client.lRem(RedisConfig.KEYS.WAITING_LIST, 0, playerId);
    }

    async getWaitingListLength(): Promise<number> {
        return await this.client.lLen(RedisConfig.KEYS.WAITING_LIST);
    }
}