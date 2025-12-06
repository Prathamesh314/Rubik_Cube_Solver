import type { Room } from '@/modals/room';

export interface MatchmakingResult {
    queued: boolean;
    room: Room;
}

export interface FriendMatchResult {
    roomId: string;
    isGameStarted: boolean;
}

export interface RedisConnectionOptions {
    url: string;
    reconnectStrategy?: (retries: number) => number | Error;
}

export interface LockOptions {
    ttlSeconds?: number;
    maxRetries?: number;
    retryDelayMs?: number;
}