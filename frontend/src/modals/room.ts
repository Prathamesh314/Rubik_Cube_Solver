import { randomUUID } from "crypto";
import { Player, CubeCategories } from "./player";

export interface Room {
    id: string;
    players: string[]; // [p1, p2]
    maxPlayers: number;
    gameState: any;
    variant: CubeCategories;
    createdAt: number;
}

export class RoomState {
    room_id: string;
    player1: Player;
    player2: Player;
    created_at: Date;
    constructor(player1: Player, player2: Player, created_at: Date){
        this.room_id = randomUUID();
        this.player1 = player1;
        this.player2 = player2;
        this.created_at = created_at;
    }
}