import type { Player } from '@/modals/player';
import { RATING_INCREMENT } from '../constants';
import { Env } from '@/lib/env_config';

export class DatabaseService {
    // database-service.ts
    async updatePlayerStats(
        player: Player | undefined,
        roomId: string | null,
        gameResult: "won" | "lost"
    ): Promise<void> {
        if (!player) {
            console.warn('Cannot update stats: player is undefined');
            return;
        }

        try {
            const response = await fetch(`${Env.NEXT_PUBLIC_FRONTEND_URL}/api/update_user`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: player.player_id,
                    ratingIncrement: RATING_INCREMENT,
                    game_result: gameResult,
                    roomId,
                    skipCleanup: true // ADD THIS FLAG
                })
            });

            if (!response.ok) {
                console.error(`Failed to update player stats for ${player.player_id}: ${response.statusText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`Updated stats for player ${player.player_id}: ${gameResult}`);
        } catch (error) {
            console.error(`Error updating player stats for ${player.player_id}:`, error);
            throw error; // Re-throw to handle in caller
        }
    }

    // Add new method for cleanup
    async cleanupGamePlayers(playerIds: string[], roomId: string): Promise<void> {
        try {
            const response = await fetch(`${Env.NEXT_PUBLIC_FRONTEND_URL}/api/cleanup_game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerIds,
                    roomId
                })
            });

            if (!response.ok) {
                console.error(`Failed to cleanup game data: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error cleaning up game data:', error);
        }
    }

    async deleteGameRoom(roomId: string): Promise<void> {
        try {
            const response = await fetch(`${Env.NEXT_PUBLIC_FRONTEND_URL}/api/delete_game_room`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`Deleted game room: ${roomId}`);
        } catch (error) {
            console.error(`Error deleting game room ${roomId}:`, error);
        }
    }

    /**
     * Insert a new game into the history
     */
    async insertGameHistory(
        roomId: string,
        playerId: string,
        opponentPlayerId: string,
        ratingChange: number
    ): Promise<void> {
        try {
            const response = await fetch(`${Env.NEXT_PUBLIC_FRONTEND_URL}/api/insert_game_history`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomId,
                    playerId,
                    opponentPlayerId,
                    started_at: new Date().toISOString(),
                    rating_change: ratingChange
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`Inserted game history for room: ${roomId}`);
        } catch (error) {
            console.error(`Error inserting game history for ${roomId}:`, error);
        }
    }

    /**
     * Update game history with the winner
     */
    async updateGameHistory(roomId: string, winnerPlayerId: string): Promise<void> {
        try {
            const response = await fetch(`${Env.NEXT_PUBLIC_FRONTEND_URL}/api/update_game_history`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomId,
                    winnerPlayerId,
                    ended_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`Updated game history for room ${roomId}, winner: ${winnerPlayerId}`);
        } catch (error) {
            console.error(`Error updating game history for ${roomId}:`, error);
        }
    }
}