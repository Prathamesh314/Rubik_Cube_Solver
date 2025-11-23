import { NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

// PATCH /api/update_game_history
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { roomId, winnerPlayerId, ended_at } = body;

    // Basic validation
    if (!roomId || !winnerPlayerId || !ended_at) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: roomId, winnerPlayerId, ended_at are mandatory." },
        { status: 400 }
      );
    }

    const postgresDb = await dbConnect();

    // Update the game_history table, set winner and ended_at
    await sql`
      UPDATE ${sql.table(tables.game_history)}
      SET
        winner_user_id = ${winnerPlayerId},
        ended_at = ${ended_at},
        updated_at = NOW()
      WHERE id = ${roomId}
    `.execute(postgresDb.connection());

    return NextResponse.json({
      success: true,
      message: "Game history updated successfully."
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
