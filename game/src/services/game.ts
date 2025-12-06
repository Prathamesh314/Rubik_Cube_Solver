// src/modals/game.ts
import { Player, CubeCategories } from "@/modals/player";
import { Room } from "@/modals/room";
import { Redis } from "@/redis/index";

class Game {
  private static _instance: Game | null = null;
  private redis!: Redis;
  private _initialized = false;

  private constructor() {}

  static async getInstance(): Promise<Game> {
    const g = globalThis as any;
    if (!g.__GAME_SINGLETON__) {
      g.__GAME_SINGLETON__ = new Game();
    }
    const inst: Game = g.__GAME_SINGLETON__;

    if (!inst._initialized) {
      await inst.initialize();
    }
    return inst;
  }

  private async initialize(): Promise<void> {
    if (this._initialized) return;
    this.redis = Redis.getInstance();
    await this.redis.connect(); 
    this._initialized = true;
  }

  /**
   * Start game flow using your Redis matchmaking:
   * - If opponent exists -> { queued:false, room }
   * - If no opponent -> { queued:true, player_id }
   */
  async findPlayer(player: Player, variant: CubeCategories): Promise<{queued: true | false, room: Room}> {
    if (!this._initialized) await this.initialize();
    return this.redis.tryMatchOrEnqueue(player, variant);
  }

  async startFriendsMatch(player: Player, variant: CubeCategories, isOpponentReady: boolean, opponentPlayerId?: string) {
    if (!this._initialized) await this.initialize();
    return await this.redis.startFriendMatch(player, variant, isOpponentReady, opponentPlayerId)
  }

  async getRoom(room_id: string) {
    return await this.redis.getRoom(room_id)
  }

  async removePlayerFromRoom(roomId: string, playerId: string){
    return await this.redis.removePlayerFromRoom(playerId, roomId);
  }

  async deleteRoom(roomId: string) {
    await this.redis.deleteRoom(roomId)
  }

  async deletePlayer(playerId: string) {
    await this.redis.deletePlayer(playerId)
  }

  async deletePlayerRoom(playerId: string, roomId: string | null) {
    await this.redis.removePlayerFromRoom(playerId, roomId)
  }

}

export { Game };
