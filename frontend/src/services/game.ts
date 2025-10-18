
import { Player } from '@/models/player';
import { Redis } from '@/utils/redis';

interface Room {
    id: string;
    players: string[];
    maxPlayers: number;
    gameState: any;
}


export class Game {
    private redis: Redis;
    private roomId: string;

    constructor(roomId: string) {
        // Get the singleton instance - no new Redis client is created
        this.redis = Redis.getInstance();
        this.roomId = roomId;
    }

    async initialize(): Promise<void> {
        // Ensure Redis is connected (safe to call multiple times)
        await this.redis.connect();
    }
}