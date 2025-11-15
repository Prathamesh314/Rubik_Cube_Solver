import { Player, CubeCategories, PlayerState } from '@/modals/player';
import { createClient, RedisClientType } from 'redis';
import { Room } from '@/modals/room';
import { Cube, FaceName } from "@/components/cube";
import { SimpleCubeHelper } from "@/utils/cube_helper";

const REDIS_URL = process.env.REDIS_URL as string;
const REDIS_PORT = process.env.REDIS_PORT as string;

const PLAYERS_HASH_KEY = "players";
const ROOMS_HASH_KEY = "rooms";
const PLAYER_ROOMS_HASH_KEY = "player:room"; 

const waitingKey = (variant: CubeCategories) => `mm:${variant}:waiting`;
export function generateScrambledCube(number_of_moves: number): { state: Cube; moves: string[] } {
    let cube = [
      [[1,1,1],[1,1,1],[1,1,1]], // Back - Red
      [[4,4,4],[4,4,4],[4,4,4]], // Up - Yellow
      [[5,5,5],[5,5,5],[5,5,5]], // Front - Orange
      [[6,6,6],[6,6,6],[6,6,6]], // Down - White
      [[2,2,2],[2,2,2],[2,2,2]], // Left - Green
      [[3,3,3],[3,3,3],[3,3,3]], // Right - Blue
    ];
    const helper = new SimpleCubeHelper();
    const faces: FaceName[] = ["U", "D", "F", "B", "L", "R"];
    const moves: string[] = [];
    let prevFace: FaceName | null = null;
  
    for (let i = 0; i < number_of_moves; i++) {
      // Choose a random face, but avoid repeating the same face consecutively
      let face: FaceName;
      do {
        face = faces[Math.floor(Math.random() * faces.length)];
      } while (face === prevFace);
  
      prevFace = face;
      const clockwise = Math.random() < 0.5;
  
      // Apply the move
      switch (face) {
        case "U":
          cube = helper.rotateU(cube, clockwise);
          break;
        case "D":
          cube = helper.rotateD(cube, clockwise);
          break;
        case "F":
          cube = helper.rotateF(cube, clockwise);
          break;
        case "B":
          cube = helper.rotateB(cube, clockwise);
          break;
        case "L":
          cube = helper.rotateL(cube, clockwise);
          break;
        case "R":
          cube = helper.rotateR(cube, clockwise);
          break;
      }
  
      // Record the move in standard notation
      moves.push(`${face}${clockwise ? '' : "'"}`);
    }
  
    return { state: cube, moves };
}

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

    async update_player_cube(player_id: string, cube: number[][][]) {
        const player = await this.get_player(player_id)
        if (player) {
            player.scrambledCube = cube;
            await this.upsert_player(player_id, player);
            return
        } else {
            throw Error("Cannot find player. I donot know how we ran into this error!!")
        }
    }

    async set_player_room(playerId: string, roomId: string): Promise<void> {
        this.ensureConnection();
        await this.redis_client!.hSet(PLAYER_ROOMS_HASH_KEY, playerId, roomId);
    }

    async remove_player_from_room(playerId: string, roomId: string): Promise<boolean> {
        this.ensureConnection();
        const currentRoom = await this.redis_client!.hGet(PLAYER_ROOMS_HASH_KEY, playerId);
        if (currentRoom === roomId) {
            await this.redis_client!.hDel(PLAYER_ROOMS_HASH_KEY, playerId);
            await this.redis_client!.hDel(PLAYERS_HASH_KEY, playerId);
            return true;
        }
        return false;
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
        const result = await this.redis_client!.del(ROOMS_HASH_KEY);
        return result > 0;
    }

    async upsert_room(room_id: string, room: Room) {
        this.ensureConnection();
        await this.redis_client!.hSet(ROOMS_HASH_KEY, room_id, JSON.stringify(room));
    }

    async insert_room(room: Room) {
        this.ensureConnection();
        if (room.initialState.length === 0) {
            room.initialState = generateScrambledCube(20).state
        }
        await this.redis_client!.hSet(ROOMS_HASH_KEY, room.id, JSON.stringify(room));
    }

    async get_room(roomId: string): Promise<Room> {
        const roomStr = await this.redis_client!.hGet(ROOMS_HASH_KEY, roomId);
        if (!roomStr) {
            throw new Error(`Room with id ${roomId} not found`);
        }
        return JSON.parse(roomStr) as Room;
    }

    async tryMatchOrEnqueue(
        player: Player,
        roomId: string,
        variant: CubeCategories
    ): Promise<
        | { queued: true | false; room: Room; }
    > {
        const has_players = await this.has_players();
        if (has_players) {
            const players = await this.get_all_players();
            // fetch which room the player1 is waiting inside??
            const opponent_player = players[0]
            player.updateCube(opponent_player.getCube())

            const roomID = await this.get_player_room(opponent_player.player_id);
            if (roomID === null){
                throw new Error("We ran into mysterious error, room id is somehow none for a player waiting ..")
            }
            const room: Room = await this.get_room(roomID);
            room.players.push(player);

            await this.upsert_room(roomID, room)
            await this.insert_player(player);

            player.player_state = PlayerState.Playing
            opponent_player.player_state = PlayerState.Playing
            await this.upsert_player(player.player_id, player);
            await this.upsert_player(opponent_player.player_id, opponent_player)
            
            await this.set_player_room(player.player_id, roomId)

            return {queued: false, room: room}

        }
        // i think we should store room as well, because we have list of player id saved there.
        const initialCubeState = generateScrambledCube(20).state
        player.updateCube(initialCubeState)
        const room: Room = {
            id: roomId,
            players: [player],
            maxPlayers: 2,
            gameState: { status: "init", variant },
            initialState: initialCubeState,
            variant,
            createdAt: Date.now(),
        };
        await this.insert_player(player)
        await this.insert_room(room)
        await this.set_player_room(player.player_id, roomId)

        return {queued: true, room: room}
    }
}