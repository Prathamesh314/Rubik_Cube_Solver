import { WebSocket } from 'ws';
import { GameEventTypes } from '@/types/game-events';
import type { GameServerState } from '../types';

export class BroadcastService {
    private state: GameServerState;

    constructor(state: GameServerState) {
        this.state = state;
    }

    broadcastToRoom(roomId: string, message: any): void {
        const playerConnections = this.state.rooms.get(roomId);
        if (!playerConnections) {
            console.warn(`No players found in room: ${roomId}`);
            return;
        }

        const messageStr = JSON.stringify(message);
        let sentCount = 0;

        for (const playerConn of playerConnections) {
            if (playerConn.ws.readyState === WebSocket.OPEN) {
                playerConn.ws.send(messageStr);
                sentCount++;
            }
        }

        console.log(`Broadcast to room ${roomId}: ${sentCount}/${playerConnections.length} players`);
    }

    broadcastGlobal(message: any): void {
        const messageStr = JSON.stringify(message);
        let sentCount = 0;

        for (const client of this.state.onlinePlayers.values()) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageStr);
                sentCount++;
            }
        }

        console.log(`Global broadcast sent to ${sentCount} players`);
    }

    sendToPlayer(playerId: string, message: any): boolean {
        const ws = this.state.onlinePlayers.get(playerId);
        
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn(`Player ${playerId} is not available`);
            return false;
        }

        ws.send(JSON.stringify(message));
        return true;
    }

    sendError(ws: WebSocket, errorMessage: string): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: GameEventTypes.Error,
                value: errorMessage
            }));
        }
    }

    broadcastPlayerStatus(playerId: string, status: "online" | "offline"): void {
        this.broadcastGlobal({
            type: GameEventTypes.PlayerStatusUpdate,
            value: {
                userId: playerId,
                status
            }
        });
    }

    broadcastOnlinePlayersList(onlinePlayerIds: string[]): void {
        this.broadcastGlobal({
            type: GameEventTypes.PlayerStatusUpdate,
            value: onlinePlayerIds
        });
    }
}