import { createClient, RedisClientType } from 'redis';
import { RedisConfig } from './config';

export class RedisClient {
    private client?: RedisClientType;
    private isConnected: boolean = false;
    private connectionPromise?: Promise<void>;

    constructor(
        private readonly url: string = RedisConfig.URL,
        private readonly port: string = RedisConfig.PORT
    ) {}

    async connect(): Promise<void> {
        // Return existing connection promise if already connecting
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // Return immediately if already connected
        if (this.isConnected && this.client) {
            console.log('Redis client already connected');
            return;
        }

        // Create new connection promise
        this.connectionPromise = this.establishConnection();
        
        try {
            await this.connectionPromise;
        } finally {
            this.connectionPromise = undefined;
        }
    }

    private async establishConnection(): Promise<void> {
        try {
            if (!this.client) {
                this.client = createClient({
                    url: this.url,
                    socket: {
                        reconnectStrategy: this.getReconnectStrategy(),
                    },
                });

                this.setupEventListeners();
            }

            if (!this.isConnected) {
                await this.client.connect();
                this.isConnected = true;
                console.log(`✅ Redis connected on Port: ${this.port}`);
            }
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error);
            throw error;
        }
    }

    private setupEventListeners(): void {
        if (!this.client) return;

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            console.log('Redis Client Connected');
            this.isConnected = true;
        });

        this.client.on('ready', () => {
            console.log(`Redis Ready on Port: ${this.port}`);
        });

        this.client.on('end', () => {
            console.log('Redis Client Connection Closed');
            this.isConnected = false;
        });

        this.client.on('reconnecting', () => {
            console.log('Redis Client Reconnecting...');
        });
    }

    private getReconnectStrategy() {
        return (retries: number): number | Error => {
            if (retries > RedisConfig.RECONNECT.MAX_RETRIES) {
                console.error('Too many Redis reconnection attempts');
                return new Error('Too many reconnection attempts');
            }
            const delay = Math.min(
                retries * RedisConfig.RECONNECT.BASE_DELAY_MS,
                RedisConfig.RECONNECT.MAX_DELAY_MS
            );
            console.log(`Reconnecting to Redis in ${delay}ms (attempt ${retries})`);
            return delay;
        };
    }

    async disconnect(): Promise<void> {
        if (this.client && this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
            console.log('Redis client disconnected');
        }
    }

    getClient(): RedisClientType {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis client is not connected. Call connect() first.');
        }
        return this.client;
    }

    isClientConnected(): boolean {
        return this.isConnected;
    }

    async ping(): Promise<boolean> {
        try {
            const response = await this.getClient().ping();
            return response === 'PONG';
        } catch (error) {
            console.error('Redis ping failed:', error);
            return false;
        }
    }
}