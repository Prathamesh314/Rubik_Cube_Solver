import { NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

// GET /api/fetch_game_history?userId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing required field: userId" },
        { status: 400 }
      );
    }

    const postgresDb = await dbConnect();

    // Fetch game_history where user_id or opponent_id matches userId
    const result = await sql`
      SELECT *
      FROM ${sql.table(tables.game_history)}
      WHERE user_id = ${userId}
         OR opponent_id = ${userId}
      ORDER BY started_at DESC
    `.execute(postgresDb.connection());

    const games = result.rows;

    return NextResponse.json({
      success: true,
      games,
      count: games.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
