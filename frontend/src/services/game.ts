
import { Player, CubeCategories } from '@/modals/player';
import { Redis } from '@/utils/redis';
import { Room } from '@/modals/room';

export class Game {
    private static redis: Redis;

    static async initialize(): Promise<void> {
        // Ensure Redis is connected (safe to call multiple times)
        if (this.redis === undefined) {
            this.redis = Redis.getInstance()
        }
        await this.redis.connect();
    }

    /**
     * Start game flow:
     * - If opponent is found now -> returns { status: "matched", room }
     * - If queued -> returns { status: "queued" } (front-end can poll or be notified later)
     */
    static async start_game(player: Player, roomId: string, variant: CubeCategories): Promise<{queued: true | false ; room: Room }> {
        if (this.redis === undefined) {
            this.redis = Redis.getInstance();
            this.redis.connect()
        }
        return await this.redis.tryMatchOrEnqueue(player, roomId, variant);
    }
}