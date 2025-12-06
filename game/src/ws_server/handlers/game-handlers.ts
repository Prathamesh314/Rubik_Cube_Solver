import { WebSocket } from 'ws';
import type { Player } from '@/modals/player';
import { GameEventTypes } from '@/types/game-events';
import { RoomService } from '../services/room-service';
import { BroadcastService } from '../services/broadcast-service';
import { DatabaseService } from '../services/database-service';
import { VALID_KEY_PRESSES, RATING_INCREMENT } from '../constants';

export class GameHandlers {
    constructor(
        private roomService: RoomService,
        private broadcastService: BroadcastService,
        private databaseService: DatabaseService
    ) {}

    async handleGameStarted(ws: WebSocket, value: any): Promise<void> {
        const { roomId, player } = value;
        console.log("Game started event received:", { roomId, playerId: player.player_id });

        // Add player to room
        this.roomService.addPlayerToRoom(roomId, ws, player);

        // If room is full, start the game
        if (this.roomService.isRoomFull(roomId)) {
            const playersInRoom = this.roomService.getPlayersInRoom(roomId);
            
            if (playersInRoom && playersInRoom.length === 2) {
                // Broadcast game start to both players
                this.broadcastService.broadcastToRoom(roomId, {
                    type: GameEventTypes.GameStarted,
                    value: playersInRoom
                });

                // Insert game history
                console.log("Inserting game history in database");
                await this.databaseService.insertGameHistory(
                    roomId,
                    playersInRoom[0].player_id,
                    playersInRoom[1].player_id,
                    RATING_INCREMENT
                );
            }
        }
    }

    handleGameStartedAI(ws: WebSocket, value: any): void {
        const { roomId, players } = value;

        // Add both human and AI players to room
        this.roomService.addPlayerToRoom(roomId, ws, players[0]);
        this.roomService.addPlayerToRoom(roomId, ws, players[1]);

        // Send confirmation to client
        ws.send(JSON.stringify({
            type: GameEventTypes.GameStartedAI,
            value: { players }
        }));
    }

    handleKeyboardButtonPressed(ws: WebSocket, value: any): void {
        const { keyboardButton, direction, player, room } = value;
        const roomId = room.id;

        if (!VALID_KEY_PRESSES.includes(keyboardButton)) {
            console.log("Ignoring invalid key press:", keyboardButton);
            return;
        }

        // Broadcast the move to all players in the room
        this.broadcastService.broadcastToRoom(roomId, {
            type: GameEventTypes.KeyBoardButtonPressed,
            value: {
                player,
                keybutton_pressed: keyboardButton,
                clockwise: direction
            }
        });
    }

    // game-handlers.ts
    async handleGameFinished(ws: WebSocket, value: any): Promise<void> {
        const { roomId, player_id_who_won } = value;
        const playerConns = this.roomService.getPlayersInRoom(roomId);

        if (!playerConns || playerConns.length === 0) {
            this.broadcastService.sendError(ws, "Game finished but players map is empty");
            return;
        }

        // Identify winner and loser
        let playerWon: Player | undefined;
        let playerLost: Player | undefined;

        for (const playerConn of playerConns) {
            if (playerConn.player.player_id === player_id_who_won) {
                playerWon = playerConn.player;
            } else {
                playerLost = playerConn.player;
            }
        }

        // Notify all players in the room
        this.broadcastService.broadcastToRoom(roomId, {
            type: GameEventTypes.GameFinished,
            value: {
                player_id_who_won: playerWon?.player_id,
            }
        });

        // Cleanup room first
        this.roomService.removeRoom(roomId);
        
        try {
            // Update stats for both players
            await Promise.all([
                this.databaseService.updatePlayerStats(playerWon, roomId, "won"),
                this.databaseService.updatePlayerStats(playerLost, roomId, "lost"),
            ]);

            // Then do game history and cleanup
            await Promise.all([
                this.databaseService.deleteGameRoom(roomId),
                playerWon ? this.databaseService.updateGameHistory(roomId, playerWon.player_id) : Promise.resolve(),
                this.databaseService.cleanupGamePlayers(
                    [playerWon?.player_id, playerLost?.player_id].filter(Boolean) as string[],
                    roomId
                )
            ]);
        } catch (error) {
            console.error(`Error handling game finish for room ${roomId}:`, error);
        }

        console.log(`Game finished in room ${roomId}. Winner: ${playerWon?.player_id}`);
    }
}