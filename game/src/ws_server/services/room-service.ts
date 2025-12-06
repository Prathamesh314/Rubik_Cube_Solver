import { WebSocket } from 'ws';
import type { Player } from '@/modals/player';
import type { PlayerConnection, GameServerState } from '../types';

export class RoomService {
    private state: GameServerState;

    constructor(state: GameServerState) {
        this.state = state;
    }

    addPlayerToRoom(roomId: string, ws: WebSocket, player: Player): PlayerConnection {
        const playerConn: PlayerConnection = {
            ws,
            player_id: player.player_id,
            player
        };

        if (!this.state.rooms.has(roomId)) {
            this.state.rooms.set(roomId, []);
        }

        const room = this.state.rooms.get(roomId)!;
        room.push(playerConn);
        this.state.rooms.set(roomId, room);

        return playerConn;
    }

    getPlayersInRoom(roomId: string): PlayerConnection[] | undefined {
        return this.state.rooms.get(roomId);
    }

    isRoomFull(roomId: string): boolean {
        const room = this.state.rooms.get(roomId);
        return room ? room.length === 2 : false;
    }

    removeRoom(roomId: string): void {
        this.state.rooms.delete(roomId);
    }

    findPlayerInRoom(roomId: string, playerId: string): PlayerConnection | undefined {
        const room = this.state.rooms.get(roomId);
        if (!room) return undefined;

        return room.find(conn => conn.player_id === playerId);
    }

    getAllRoomIds(): string[] {
        return Array.from(this.state.rooms.keys());
    }

    roomExists(roomId: string): boolean {
        return this.state.rooms.has(roomId);
    }
}