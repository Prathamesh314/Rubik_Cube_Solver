import { Player, CubeCategories, PlayerState } from '@/modals/player';
import { createClient, RedisClientType } from 'redis';
import { randomUUID } from 'crypto';
import { Room } from '@/modals/room';

const REDIS_URL = process.env.REDIS_URL as string;
const REDIS_PORT = process.env.REDIS_PORT as string;

// We store all players under this single Hash key
const PLAYERS_HASH_KEY = "players";
// waiting pool per variant: mm:<variant>:waiting | mm: stands for matchmaking.
const waitingKey = (variant: CubeCategories) => `mm:${variant}:waiting`;
const ROOMS_HASH_KEY = "rooms";

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

    async insert_player(player: Player): Promise<boolean> {
        this.ensureConnection();
        const field = player.player_id;
        const value = JSON.stringify(Player.toPlain(player));

        const inserted = await (this.redis_client as any).hSetNX(
            PLAYERS_HASH_KEY,
            field,
            value
        );
        return inserted === 1;
    }

    async upsert_player(player: Player): Promise<void> {
        this.ensureConnection();
        const field = player.player_id;
        const value = JSON.stringify(Player.toPlain(player));
        await this.redis_client!.hSet(PLAYERS_HASH_KEY, field, value);
      }

    async get_player(player_id: string): Promise<Player | null> {
        this.ensureConnection();
        const raw = await this.redis_client!.hGet(PLAYERS_HASH_KEY, player_id);
        if (!raw) return null;
        return Player.fromPlain(JSON.parse(raw));
    }

    async get_all_players(): Promise<Player[]> {
        this.ensureConnection();
        const all = await this.redis_client!.hGetAll(PLAYERS_HASH_KEY);
        if (!all || Object.keys(all).length === 0) return [];
        return Object.values(all).map((v) => Player.fromPlain(JSON.parse(v)));
    }

    async has_player(player_id: string): Promise<boolean> {
        this.ensureConnection();
        const exists = await this.redis_client!.hExists(PLAYERS_HASH_KEY, player_id);
        return !!exists;
    }

    async setPlayerState(player_id: string, state: PlayerState): Promise<void> {
        const p = await this.get_player(player_id);
        if (!p) return;
        p.player_state = state;
        await this.upsert_player(p);
    }

    async delete_player(player_id: string): Promise<number> {
        this.ensureConnection();
        return await this.redis_client!.hDel(PLAYERS_HASH_KEY, player_id);
    }

    // ---------- Matchmaking MVP ----------
    /**
     * Try to match the given player in a waiting pool for the variant.
     * If the waiting pool is empty: enqueue player (Waiting), return {queued:true}
     * If not empty: pop one opponent, create a room, set both to Playing, return room.
     * NOTE: MVP assumes single server instance; fine for your first version.
     */
    async tryMatchOrEnqueue(
        player: Player,
        variant: CubeCategories
    ): Promise<
        | { queued: true; player_id: string }
        | { queued: false; room: Room; opponent: Player }
    > {
        this.ensureConnection();

        // Ensure player record exists/up-to-date
        await this.upsert_player(player);

        const wKey = waitingKey(variant);

        // 1) Is someone already waiting?
        const waitingCount = await this.redis_client!.hLen(wKey);

        if (waitingCount === 0) {
        // No one waiting -> enqueue this player
        await this.redis_client!.hSet(wKey, player.player_id, JSON.stringify(Player.toPlain(player)));
        await this.setPlayerState(player.player_id, PlayerState.Waiting);
        return { queued: true, player_id: player.player_id };
        }

        // 2) Someone is waiting -> fetch ONE opponent (hash is unordered; OK for MVP)
        const keys = await this.redis_client!.hKeys(wKey);
        const opponentId = keys.find((k) => k !== player.player_id) ?? keys[0]; // avoid self
        const opponentRaw = await this.redis_client!.hGet(wKey, opponentId);
        if (!opponentRaw) {
        // rare race; just enqueue current player as fallback
        await this.redis_client!.hSet(wKey, player.player_id, JSON.stringify(Player.toPlain(player)));
        await this.setPlayerState(player.player_id, PlayerState.Waiting);
        return { queued: true, player_id: player.player_id };
        }

        // Remove opponent from waiting
        await this.redis_client!.hDel(wKey, opponentId);

        const opponent = Player.fromPlain(JSON.parse(opponentRaw));

        // Create room
        const room: Room = {
        id: randomUUID(),
        players: [opponent.player_id, player.player_id],
        maxPlayers: 2,
        gameState: { status: "init", variant },
        variant,
        createdAt: Date.now(),
        };

        // Persist room (simple: one hash of rooms)
        await this.redis_client!.hSet(ROOMS_HASH_KEY, room.id, JSON.stringify(room));

        // Update both players to Playing
        await this.setPlayerState(opponent.player_id, PlayerState.Playing);
        await this.setPlayerState(player.player_id, PlayerState.Playing);

        return { queued: false, room, opponent };
    }
}