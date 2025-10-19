
import { Player, CubeCategories } from '@/modals/player';
import { Redis } from '@/utils/redis';
import { Room } from '@/modals/room';

export class Game {
    private redis: Redis;
    private currentPlayer: Player;
    private variant: CubeCategories;
    private _room? : Room

    constructor(currentPlayer: Player, variant: CubeCategories) {
        this.redis = Redis.getInstance();
        this.currentPlayer = currentPlayer;
        this.variant = variant;
    }

    async initialize(): Promise<void> {
        // Ensure Redis is connected (safe to call multiple times)
        await this.redis.connect();
    }

    /**
     * Start game flow:
     * - If opponent is found now -> returns { status: "matched", room }
     * - If queued -> returns { status: "queued" } (front-end can poll or be notified later)
     */
    async start_game(): Promise<
        | { status: "queued"; player_id: string }
        | { status: "matched"; room: Room }
    > {
        const res = await this.redis.tryMatchOrEnqueue(this.currentPlayer, this.variant);
        if (res.queued) {
            return { status: "queued", player_id: res.player_id };
        }
        this._room = res.room;
        return { status: "matched", room: res.room };
    }

    get room(): Room | undefined {
        return this._room;
    }
}