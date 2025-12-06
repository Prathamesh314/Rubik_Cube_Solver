export const RedisConfig = {
    URL: process.env.REDIS_URL as string,
    PORT: process.env.REDIS_PORT as string,
    
    // Redis key patterns
    KEYS: {
        PLAYERS: 'players',
        ROOMS: 'rooms',
        PLAYER_ROOMS: 'player:room',
        WAITING_LIST: 'waiting_players',
        MATCHMAKING_LOCK: 'lock:matchmaking',
    },
    
    // Lock configuration
    LOCK: {
        TTL_SECONDS: 5,
        MAX_RETRIES: 3,
        RETRY_DELAY_MS: 100,
    },
    
    // Reconnection configuration
    RECONNECT: {
        MAX_RETRIES: 10,
        BASE_DELAY_MS: 100,
        MAX_DELAY_MS: 3000,
    },
} as const;

export const getWaitingKey = (variant: string) => `mm:${variant}:waiting`;