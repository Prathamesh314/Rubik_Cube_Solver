import type { RedisClientType } from 'redis';
import { Room } from '@/modals/room';
import { RedisConfig } from '../config';
import { generateScrambledCube } from '@/utils/cube_helper';

export class RoomService {
    constructor(private readonly client: RedisClientType) {}

    async insertRoom(room: Room): Promise<void> {
        // Generate scrambled cube if not provided
        if (room.initialState.length === 0) {
            room.initialState = generateScrambledCube().state;
        }

        await this.client.hSet(
            RedisConfig.KEYS.ROOMS,
            room.id,
            JSON.stringify(room)
        );
    }

    async upsertRoom(roomId: string, room: Room): Promise<void> {
        await this.client.hSet(
            RedisConfig.KEYS.ROOMS,
            roomId,
            JSON.stringify(room)
        );
    }

    async getRoom(roomId: string | null): Promise<Room | null> {
        if (!roomId) return null;

        const roomStr = await this.client.hGet(RedisConfig.KEYS.ROOMS, roomId);
        
        if (!roomStr) {
            throw new Error(`Room not found: ${roomId}`);
        }

        return JSON.parse(roomStr) as Room;
    }

    async getAllRooms(): Promise<Room[]> {
        const roomsObj = await this.client.hGetAll(RedisConfig.KEYS.ROOMS);
        const rooms: Room[] = [];

        for (const value of Object.values(roomsObj)) {
            try {
                rooms.push(JSON.parse(value) as Room);
            } catch (error) {
                console.error('Failed to parse room:', error);
                // Skip invalid entries
            }
        }

        return rooms;
    }

    async deleteRoom(roomId: string | null): Promise<boolean> {
        if (!roomId) return false;

        const result = await this.client.hDel(RedisConfig.KEYS.ROOMS, roomId);
        return result > 0;
    }

    async deleteAllRooms(): Promise<boolean> {
        const result = await this.client.del(RedisConfig.KEYS.ROOMS);
        return result > 0;
    }

    async roomExists(roomId: string): Promise<boolean> {
        const exists = await this.client.hExists(RedisConfig.KEYS.ROOMS, roomId);
        return exists == 1;
    }

    async getRoomCount(): Promise<number> {
        return await this.client.hLen(RedisConfig.KEYS.ROOMS);
    }

    async setPlayerRoom(playerId: string, roomId: string): Promise<void> {
        await this.client.hSet(RedisConfig.KEYS.PLAYER_ROOMS, playerId, roomId);
    }

    async getPlayerRoom(playerId: string): Promise<string | null> {
        const roomId = await this.client.hGet(
            RedisConfig.KEYS.PLAYER_ROOMS,
            playerId
        );
        return roomId ?? null;
    }

    async removePlayerFromRoom(
        playerId: string,
        roomId: string | null
    ): Promise<boolean> {
        if (!roomId) return true;

        const currentRoomId = await this.getPlayerRoom(playerId);
        if (currentRoomId !== roomId) {
            return false;
        }

        const room = await this.getRoom(roomId);
        if (room) {
            room.players = room.players.filter((p) => p.player_id !== playerId);
            await this.upsertRoom(roomId, room);
        }

        await this.client.hDel(RedisConfig.KEYS.PLAYER_ROOMS, playerId);

        return true;
    }

    async clearPlayerRoomMappings(): Promise<void> {
        await this.client.del(RedisConfig.KEYS.PLAYER_ROOMS);
    }

    async getAllPlayerRoomMappings(): Promise<Map<string, string>> {
        const mappings = await this.client.hGetAll(RedisConfig.KEYS.PLAYER_ROOMS);
        return new Map(Object.entries(mappings));
    }
}