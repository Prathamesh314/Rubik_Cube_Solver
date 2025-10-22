import { Player, CubeCategories, PlayerState } from '@/modals/player';
import { createClient, RedisClientType } from 'redis';
import { Room } from '@/modals/room';

const REDIS_URL = process.env.REDIS_URL as string;
const REDIS_PORT = process.env.REDIS_PORT as string;

// We store all players under this single Hash key
const PLAYERS_HASH_KEY = "players";
const ROOMS_HASH_KEY = "rooms";
const PLAYER_ROOMS_HASH_KEY = "player:room"; // field = player_id, value = roomId

// waiting pool per variant: mm:<variant>:waiting | mm: stands for matchmaking.
const waitingKey = (variant: CubeCategories) => `mm:${variant}:waiting`;

// Redis ==> {
//     "namespace": {
//         "players": {
//             "player_id": Player
//         },
//         "room": {
//             "roomId": "playerId"
//         }
//     }
// }

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
        player.player_state = PlayerState.Waiting;
        const field = player.player_id;
        const value = JSON.stringify(Player.toPlain(player));

        const inserted = await (this.redis_client as any).hSetNX(
            PLAYERS_HASH_KEY,
            field,
            value
        );
        return inserted === 1;
    }

    async upsert_player(player_id: string, player: Player){
        const value = JSON.stringify(Player.toPlain(player));
        await this.redis_client?.hSet(PLAYERS_HASH_KEY, player_id, value);
    }

    async get_player(player_id: string): Promise<Player | null> {
        this.ensureConnection();
        const raw = await this.redis_client!.hGet(PLAYERS_HASH_KEY, player_id);
        if (!raw) return null;
        return Player.fromPlain(JSON.parse(raw));
    }

    async get_all_players(variant?: CubeCategories): Promise<Player[]> {
        this.ensureConnection();
        let wKey: string | undefined = undefined;
        if (variant !== undefined) {
            wKey = waitingKey(variant);
        }
        // If wKey is undefined, use PLAYERS_HASH_KEY to get all players
        const keyToUse = wKey === undefined ? PLAYERS_HASH_KEY : wKey;
        const all = await this.redis_client!.hGetAll(keyToUse);
        if (!all || Object.keys(all).length === 0) return [];
        return Object.values(all).map((v) => Player.fromPlain(JSON.parse(v)));
    }

    async delete_player(player_id: string): Promise<number> {
        this.ensureConnection();
        return await this.redis_client!.hDel(PLAYERS_HASH_KEY, player_id);
    }

    async delete_all_players(): Promise<boolean> {
        this.ensureConnection();
        // Delete the entire hash of players by deleting the PLAYERS_HASH_KEY
        const result = await this.redis_client!.del(PLAYERS_HASH_KEY);
        return result > 0;
    }

    async has_players(): Promise<boolean> {
        const res = await this.redis_client?.hLen(PLAYERS_HASH_KEY)
        return  (res !== undefined && res > 0)
    }

    /**
     * This is the code for playerId -> roomId mapping
     */
    async set_player_room(playerId: string, roomId: string): Promise<void> {
        this.ensureConnection();
        await this.redis_client!.hSet(PLAYER_ROOMS_HASH_KEY, playerId, roomId);
    }
      
    async get_player_room(playerId: string): Promise<string | null> {
        this.ensureConnection();
        const v = await this.redis_client!.hGet(PLAYER_ROOMS_HASH_KEY, playerId);
        return v ?? null;
    }
      
    async clear_player_room(): Promise<void> {
        this.ensureConnection();
        await this.redis_client!.del(PLAYER_ROOMS_HASH_KEY);
    }

    async delete_all_rooms(): Promise<boolean> {
        this.ensureConnection();
        // Delete the entire hash of players by deleting the PLAYERS_HASH_KEY
        const result = await this.redis_client!.del(ROOMS_HASH_KEY);
        return result > 0;
    }

    async upsert_room(room_id: string, room: Room) {
        this.ensureConnection();
        // Upsert: overwrite the room with same id if exists, or insert if not
        await this.redis_client!.hSet(ROOMS_HASH_KEY, room_id, JSON.stringify(room));
    }

    async insert_room(room: Room) {
        this.ensureConnection();
        // The value must be a string (because Redis hashes store string values). Store serialized Room:
        await this.redis_client!.hSet(ROOMS_HASH_KEY, room.id, JSON.stringify(room));
    }

    async get_room(roomId: string): Promise<Room> {
        const roomStr = await this.redis_client!.hGet(ROOMS_HASH_KEY, roomId);
        if (!roomStr) {
            throw new Error(`Room with id ${roomId} not found`);
        }
        return JSON.parse(roomStr) as Room;
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
        roomId: string,
        variant: CubeCategories
    ): Promise<
        | { queued: true | false; room: Room; }
    > {
        const has_players = await this.has_players();
        console.log("Has players: ", has_players);
        if (has_players) {
            const players = await this.get_all_players();
            // fetch which room the player1 is waiting inside??
            const opponent_player = players[0]

            const roomID = await this.get_player_room(opponent_player.player_id);
            if (roomID === null){
                throw new Error("We ran into mysterious error, room id is somehow none for a player waiting ..")
            }
            const room: Room = await this.get_room(roomID);
            room.players.push(player.player_id);

            await this.upsert_room(roomID, room)
            await this.insert_player(player);

            player.player_state = PlayerState.Playing
            opponent_player.player_state = PlayerState.Playing
            await this.upsert_player(player.player_id, player);
            await this.upsert_player(opponent_player.player_id, opponent_player)
            
            await this.set_player_room(player.player_id, roomId)
            // delete the player from the cache and also room as well
            // await this.delete_player(opponent_player.player_id);
            // await this.clear_player_room(opponent_player.player_id);

            return {queued: false, room: room}

        }
        // i think we should store room as well, because we have list of player id saved there.
        const room: Room = {
            id: roomId,
            players: [player.player_id],
            maxPlayers: 2,
            gameState: { status: "init", variant },
            variant,
            createdAt: Date.now(),
        };
        await this.insert_player(player)
        await this.insert_room(room)
        await this.set_player_room(player.player_id, roomId)

        return {queued: true, room: room}
    }

    // async tryMatchOrEnqueue(
    //     player: Player,
    //     variant: CubeCategories
    // ): Promise<
    //     | { queued: true; player_id: string }
    //     | { queued: false; room: Room; opponent: Player }
    // > {
    //     this.ensureConnection();

    //     return {queued: true, player_id: ""}

    //     // Ensure player record exists/up-to-date
    //     // await this.upsert_player(player);

    //     // const wKey = waitingKey(variant);

    //     // // 1) Is someone already waiting?
    //     // const waitingCount = await this.redis_client!.hLen(wKey);
    //     // console.log("Waiting count: ", waitingCount)
        
    //     // // If no one is waiting in the queue then 
    //     // if (waitingCount === 0) {
    //     //     // No one waiting -> enqueue this player
    //     //     // await this.redis_client!.hSet(wKey, player.player_id, JSON.stringify(Player.toPlain(player)));
    //     //     player.player_state = PlayerState.Waiting;
    //     //     await this.insert_player(player);
    //     //     return { queued: true, player_id: player.player_id };
    //     // }

    //     // // 2) Someone is waiting -> fetch ONE opponent (hash is unordered; OK for MVP)
    //     // const keys = await this.redis_client!.hKeys(wKey);
    //     // const opponentId = keys.find((k) => k !== player.player_id) ?? keys[0]; // avoid self
    //     // const opponentRaw = await this.redis_client!.hGet(wKey, opponentId);
    //     // if (!opponentRaw) {
    //     // // rare race; just enqueue current player as fallback
    //     // await this.redis_client!.hSet(wKey, player.player_id, JSON.stringify(Player.toPlain(player)));
    //     // await this.setPlayerState(player.player_id, PlayerState.Waiting);
    //     // return { queued: true, player_id: player.player_id };
    //     // }

    //     // // Remove opponent from waiting
    //     // await this.redis_client!.hDel(wKey, opponentId);

    //     // const opponent = Player.fromPlain(JSON.parse(opponentRaw));

    //     // // Create room
    //     // const room: Room = {
    //     //     id: randomUUID(),
    //     //     players: [opponent.player_id, player.player_id],
    //     //     maxPlayers: 2,
    //     //     gameState: { status: "init", variant },
    //     //     variant,
    //     //     createdAt: Date.now(),
    //     // };

    //     // // Persist room (simple: one hash of rooms)
    //     // await this.redis_client!.hSet(ROOMS_HASH_KEY, room.id, JSON.stringify(room));

    //     // // Update both players to Playing
    //     // await this.setPlayerState(opponent.player_id, PlayerState.Playing);
    //     // await this.setPlayerState(player.player_id, PlayerState.Playing);

    //     // return { queued: false, room, opponent };
    // }
}