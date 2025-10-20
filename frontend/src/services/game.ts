// src/modals/game.ts
import { Player, CubeCategories } from "@/modals/player";
import { Room } from "@/modals/room";
import { Redis } from "@/utils/redis";

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
  async startGame(player: Player, roomId: string, variant: CubeCategories): Promise<{queued: true | false, room: Room}> {
    if (!this._initialized) await this.initialize();
    return this.redis.tryMatchOrEnqueue(player, roomId, variant);
  }

  async getRoom(room_id: string) {
    return await this.redis.get_room(room_id)
  }

}

export { Game };
