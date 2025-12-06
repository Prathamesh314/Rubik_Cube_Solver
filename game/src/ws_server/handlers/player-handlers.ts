import { WebSocket } from 'ws';
import { BroadcastService } from '../services/broadcast-service';
import type { GameServerState } from '../types';

export class PlayerHandlers {
    constructor(
        private state: GameServerState,
        private broadcastService: BroadcastService
    ) {}

    handlePlayerOnline(ws: WebSocket, value: any): void {
        const { playerId } = value;
        console.log(`Player ${playerId} came online`);

        this.state.onlinePlayers.set(playerId, ws);

        // Broadcast updated online status
        this.broadcastService.broadcastOnlinePlayersList(Array.from(this.state.onlinePlayers.keys()));
    }

    handlePlayerOffline(value: any): void {
        const { playerId } = value;
        console.log(`Player ${playerId} went offline`);

        this.state.onlinePlayers.delete(playerId);

        // Broadcast updated offline status
        // this.broadcastService.broadcastPlayerStatus(playerId, "offline");
        this.broadcastService.broadcastOnlinePlayersList(Array.from(this.state.onlinePlayers.keys()));
    }

    handlePlayerDisconnect(ws: WebSocket): void {
        for (const [playerId, socket] of this.state.onlinePlayers.entries()) {
            if (socket === ws) {
                this.state.onlinePlayers.delete(playerId);
                console.log(`Player ${playerId} disconnected`);
                
                // Optionally broadcast disconnect status
                this.broadcastService.broadcastPlayerStatus(playerId, "offline");
                break;
            }
        }
    }

    getOnlinePlayers(): string[] {
        return Array.from(this.state.onlinePlayers.keys());
    }

    isPlayerOnline(playerId: string): boolean {
        return this.state.onlinePlayers.has(playerId);
    }
}