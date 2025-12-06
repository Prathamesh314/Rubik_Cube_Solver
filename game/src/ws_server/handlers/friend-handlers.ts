import { WebSocket } from 'ws';
import { GameEventTypes, type FriendRequestPayload } from '@/types/game-events';
import { BroadcastService } from '../services/broadcast-service';
import { RoomService } from '../services/room-service';
import type { GameServerState } from '../types';

export class FriendHandlers {
    constructor(
        private state: GameServerState,
        private broadcastService: BroadcastService,
        private roomService: RoomService
    ) {}

    handleSendFriendRequest(value: FriendRequestPayload): void {
        const { fromUserId, fromUsername, toUserId } = value;
        
        const targetSocket = this.state.onlinePlayers.get(toUserId);

        if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(JSON.stringify({
                type: GameEventTypes.FriendRequestReceived,
                value: {
                    fromUserId,
                    fromUsername,
                    toUserId,
                    timestamp: new Date().toISOString()
                }
            }));
            console.log(`Friend request sent: ${fromUserId} → ${toUserId}`);
        } else {
            console.log(`User ${toUserId} is offline. Request should be saved to DB`);
            // TODO: Save to database for offline notification
        }
    }

    handleFriendChallenge(value: any): void {
        const { playerId, opponentPlayerId, roomId } = value;
        console.log(`Friend challenge: ${playerId} → ${opponentPlayerId} in room ${roomId}`);

        const success = this.broadcastService.sendToPlayer(opponentPlayerId, {
            type: GameEventTypes.FriendChallenge,
            value: {
                playerId,
                opponentPlayerId: playerId,
                roomId
            }
        });

        if (!success) {
            console.warn(`Failed to send challenge: opponent ${opponentPlayerId} not available`);
        }
    }

    handleFriendChallengeRejected(value: any): void {
        const { opponentPlayerId, roomId } = value;
        console.log(`Friend challenge rejected in room ${roomId}`);

        const playerConns = this.roomService.getPlayersInRoom(roomId);
        
        if (playerConns) {
            for (const playerConn of playerConns) {
                if (playerConn.player_id === opponentPlayerId) {
                    playerConn.ws.send(JSON.stringify({
                        type: GameEventTypes.FriendChallengeRejected,
                        value
                    }));
                    break;
                }
            }
        } else {
            console.warn(`Room ${roomId} not found for challenge rejection`);
        }
    }
}