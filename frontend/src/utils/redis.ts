import { Player, PlayerState } from '@/modals/player';
import { createClient, RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL as string;
const REDIS_PORT = process.env.REDIS_PORT as string;

export class Redis {
    private static instance: Redis;
    redis_client?: RedisClientType;
    redis_url: string = REDIS_URL;
    redis_port: string = REDIS_PORT;
    private isConnected: boolean = false;

    constructor() {}

    // Static method to get the singleton instance
    public static getInstance(): Redis {
        if (!Redis.instance) {
            Redis.instance = new Redis();
        }
        return Redis.instance;
    }

    async connect(): Promise<void> {
        // Prevent multiple connections
        if (this.isConnected && this.redis_client) {
            console.log('Redis client already connected');
            return;
        }

        try {
            if (!this.redis_client) {
                this.redis_client = createClient({ 
                    url: this.redis_url,
                    socket: {
                        reconnectStrategy: (retries) => {
                            if (retries > 10) {
                                console.log('Too many reconnection attempts');
                                return new Error('Too many reconnection attempts');
                            }
                            return Math.min(retries * 100, 3000);
                        }
                    }
                });

                // Set up event listeners once
                this.redis_client.on('error', (err) => {
                    console.error('Redis Client Error', err);
                    this.isConnected = false;
                });

                this.redis_client.on('connect', () => {
                    console.log('Redis Client Connected');
                    this.isConnected = true;
                });

                this.redis_client.on('ready', () => {
                    console.log(`Redis ready on Port: ${this.redis_port}`);
                });

                this.redis_client.on('end', () => {
                    console.log('Redis Client Connection Closed');
                    this.isConnected = false;
                });
            }

            if (!this.isConnected) {
                await this.redis_client.connect();
                this.isConnected = true;
                console.log(`Redis started on Port: ${this.redis_port}`);
            }
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.redis_client && this.isConnected) {
            await this.redis_client.quit();
            this.isConnected = false;
            console.log('Redis client disconnected');
        }
    }

    private ensureConnection(): void {
        if (!this.isConnected || !this.redis_client) {
            throw new Error('Redis client is not connected. Call connect() first.');
        }
    }

    insert_player(player: Player): boolean {
        this.ensureConnection();
        return true;
    }

    get_player(player_id: string): Player {
        this.ensureConnection();
        // Return a Player object with dummy values
        return {
            player_id: player_id,
            username: "dummy_user",
            player_state: PlayerState.Waiting,
            rating: 0,
            total_wins: 0,
            win_percentage: 0,
            top_speed_to_solve_cube: {},
        };
    }

    get_all_players(): Array<Player> {
        this.ensureConnection();
        return [];
    }

    has_player(): boolean {
        this.ensureConnection();
        return false;
    }

    private delete_player(player_id: string) {
        this.ensureConnection();
    }
}