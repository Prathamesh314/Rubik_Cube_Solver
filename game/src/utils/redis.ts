import { Player, CubeCategories, PlayerState } from '@/modals/player';
import { createClient, RedisClientType } from 'redis';
import { Room } from '@/modals/room';
import { Cube, FaceName } from "@/utils/cube";
import { SimpleCubeHelper } from "@/utils/cube_helper";
import { randomUUID } from 'crypto';

const REDIS_URL = process.env.REDIS_URL as string;
const REDIS_PORT = process.env.REDIS_PORT as string;

const PLAYERS_HASH_KEY = "players"; // ---> this is to store players in the queue with state = waiting
const ROOMS_HASH_KEY = "rooms"; // ---> this is to store room data which we will send in response to frontend
const PLAYER_ROOMS_HASH_KEY = "player:room";  // ---> this is to map player_ids -> roomIds because this will help in sending opponent to correct roomid
const WAITING_LIST_KEY = "waiting_players";

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

    async get_all_waiting_players(): Promise<Player[]> {
        this.ensureConnection();
        const all = await this.redis_client!.hGetAll(PLAYERS_HASH_KEY);
        if (!all || Object.keys(all).length === 0) return [];
        // Parse all and filter to only waiting players
        return Object.values(all)
            .map((v) => Player.fromPlain(JSON.parse(v)))
            .filter((p) => p.player_state === PlayerState.Waiting);
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

    async remove_player_from_room(playerId: string, roomId: string | null): Promise<boolean> {
        this.ensureConnection();
        if (!roomId) return true;
      
        const currentRoomId = await this.redis_client!.hGet(PLAYER_ROOMS_HASH_KEY, playerId);
        if (currentRoomId !== roomId) return false;
      
        const roomStr = await this.redis_client!.hGet(ROOMS_HASH_KEY, roomId);
        if (roomStr) {
          const room = JSON.parse(roomStr) as Room;
          room.players = room.players.filter(p => p.player_id !== playerId);
          await this.redis_client!.hSet(ROOMS_HASH_KEY, roomId, JSON.stringify(room));
        }
      
        await this.redis_client!.hDel(PLAYER_ROOMS_HASH_KEY, playerId);
        await this.redis_client!.hDel(PLAYERS_HASH_KEY, playerId);
      
        return true;
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

    async get_all_rooms(): Promise<Room[]> {
        this.ensureConnection();
        const roomsObj = await this.redis_client!.hGetAll(ROOMS_HASH_KEY);
        const rooms: Room[] = [];
        for (const [_, value] of Object.entries(roomsObj)) {
            try {
                rooms.push(JSON.parse(value) as Room);
            } catch (e) {
                // skip invalid entries
            }
        }
        return rooms;
    }

    async delete_all_rooms(): Promise<boolean> {
        this.ensureConnection();
        const result = await this.redis_client!.del(ROOMS_HASH_KEY);
        return result > 0;
    }

    async delete_room(roomId: string | null): Promise<void> {
        if (roomId === null) return
        this.ensureConnection();
        await this.redis_client!.hDel(ROOMS_HASH_KEY, roomId);
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

    async get_room(roomId: string | null): Promise<Room | null> {
        if (!roomId) return null;
        this.ensureConnection();
      
        const roomStr = await this.redis_client!.hGet(ROOMS_HASH_KEY, roomId);
        if (!roomStr) {
          throw new Error(`Room with id ${roomId} not found`);
        }
        return JSON.parse(roomStr) as Room;
    }

    async withMatchmakingLock(fn: () => Promise<void>) {
        const lockKey = "lock:matchmaking";
        const lockId = randomUUID();
        const acquired = await this.redis_client!.set(lockKey, lockId, { NX: true, EX: 5 });
        if (!acquired) {
          // retry or fail fast
          throw new Error("Could not acquire matchmaking lock");
        }
      
        try {
          await fn();
        } finally {
          const current = await this.redis_client!.get(lockKey);
          if (current === lockId) {
            await this.redis_client!.del(lockKey);
          }
        }
    }

    async tryMatchOrEnqueueHelper(player: Player, variant: CubeCategories) {
        // we have players in waiting queue
        const opponentPlayerId = await this.redis_client!.lPop(WAITING_LIST_KEY)
        if (opponentPlayerId === null) {
            // no players in the waiting queue
    
            // Generate scrambled cube FIRST
            const roomId = randomUUID()
            const scrambled_cube = generateScrambledCube(20).state
            
            player.updateCube(scrambled_cube)
            player.player_state = PlayerState.Waiting
            
            await this.upsert_player(player.player_id, player)
            await this.redis_client!.lPush(WAITING_LIST_KEY, player.player_id)
            // create room
            const room: Room = {
                id: roomId,
                players: [player],
                maxPlayers: 2,
                gameState: { status: "init" },
                initialState: scrambled_cube,
                variant,
                createdAt: Date.now(),
            };
    
            // insert room
            await this.insert_room(room);
    
            // map playerid to roomid
            await this.set_player_room(player.player_id, roomId)
            return {queued: true, room}
        }
        const opponent_player = await this.get_player(opponentPlayerId)
        if(opponent_player  === null){
            throw Error(`Cannot find opponent player for player id: ${opponentPlayerId}`)
        }
    
        // Update the current player with opponent's scrambled cube BEFORE inserting
        player.updateCube(opponent_player.scrambledCube) 
        player.player_state = PlayerState.Playing
        
        // Now insert player with all data set
        await this.upsert_player(player.player_id, player)
    
        // update the opponent player's state from waiting -> playing
        opponent_player.player_state = PlayerState.Playing
        await this.upsert_player(opponent_player.player_id, opponent_player)
    
        // fetch room for this player
        const roomId = await this.get_player_room(opponent_player.player_id)
        if (roomId === null) {
            throw new Error(`room id is null for player id: ${opponent_player.player_id}`);
        }
    
        await this.set_player_room(player.player_id, roomId)
        const player_room = await this.get_room(roomId)
    
        if (player_room === null) {
            throw new Error("We are bad programmers, room is not present in queue")
        }
    
        if (player_room.players.length < 2){
            player_room.players.push(player)
        }
        await this.upsert_room(roomId, player_room)
    
        return {queued: false, room: player_room}
    }

    async tryMatchOrEnqueue(
        player: Player,
        variant: CubeCategories
    ): Promise<{ queued: true | false; room: Room; }> {

        // Acquire lock, call helper, and return result outside the lock context
        let result: { queued: true | false; room: Room; };
        await this.withMatchmakingLock(async () => {
            result = await this.tryMatchOrEnqueueHelper(player, variant);
        });
        return result!;
    }

    async startFriendMatchHelper(player: Player, variant: CubeCategories, isOpponentReady: boolean, opponentPlayerId?: string) {
        // we will simply check whether we have an opponent ready or not?
        // if opponent is not ready that means, we have sent a challenge to opponent and we have to generate roomid, scrambled cube and map players and room.

        if (isOpponentReady) {
            if (opponentPlayerId === undefined) {
                throw Error("Opponent player cannot be none when isOpponentReady is true.")
            }

            const roomId = await this.get_player_room(opponentPlayerId)
            const room = await this.get_room(roomId)
            if (roomId == null || room === null) {
                throw Error(`room or roomid cannot be null for player: ${opponentPlayerId}`)
            }

            player.updateCube(room.initialState)
            player.player_state = PlayerState.Playing

            room?.players.push(player)

            await this.upsert_player(player.player_id, player)
            await this.upsert_room(roomId, room)
            await this.set_player_room(player.player_id, roomId)

            return {roomId, isGameStarted: true}
        } 

        let roomId = randomUUID();
        let scrambledCube = generateScrambledCube(3).state
        player.updateCube(scrambledCube)
        player.player_state = PlayerState.Playing

        // create a room
        const room: Room = {
            id: roomId,
            players: [player],
            maxPlayers: 2,
            gameState: { status: "init" },
            initialState: scrambledCube,
            variant,
            createdAt: Date.now(),
        };

        // insert room, player and map player id to room.
        await this.upsert_room(room.id, room);
        await this.upsert_player(player.player_id, player)
        await this.set_player_room(player.player_id, roomId)

        return {roomId, isGameStarted: false}
    }

    async startFriendMatch(player: Player, variant: CubeCategories, isOpponentReady: boolean, opponentPlayerId?: string): Promise<{ roomId: string, isGameStarted: boolean }> {

        let result: { roomId: string, isGameStarted: boolean };
        await this.withMatchmakingLock(async () => {
            result = await this.startFriendMatchHelper(player, variant, isOpponentReady, opponentPlayerId);
        });
        return result!;
    }
}
