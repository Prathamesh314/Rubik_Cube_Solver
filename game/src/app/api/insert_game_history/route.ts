import { NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

// POST /api/insert_game_history
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      roomId,
      playerId,
      opponentPlayerId,
      started_at,
      rating_change
    } = body;

    // Basic validation
    if (!roomId || !playerId || !opponentPlayerId) {
        console.log( "Missing required fields: roomId, playerId, opponentPlayerId are mandatory.")
      return NextResponse.json(
        { success: false, message: "Missing required fields: roomId, playerId, opponentPlayerId are mandatory." },
        { status: 400 }
      );
    }

    const postgresDb = await dbConnect();

    // Insert into game_history table
    await sql`
      INSERT INTO ${sql.table(tables.game_history)} (
        id,
        user_id,
        opponent_id,
        rating_change,
        started_at
      ) VALUES (
        ${roomId},
        ${playerId},
        ${opponentPlayerId},
        ${rating_change},
        ${started_at}
      )
    `.execute(postgresDb.connection());

    return NextResponse.json({
      success: true,
      id: roomId,
      message: "Game history inserted successfully."
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
