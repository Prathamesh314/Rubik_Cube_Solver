import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import {
    sql
} from 'kysely'

export async function PATCH(req: NextRequest) {
  try {
    const postgresdb = await dbConnect();

    const body = await req.json();
    let { playerId, ratingIncrement, game_result } = body;
    let total_wins_increment = 0;
    
    if (game_result === "lost") {
        ratingIncrement = -ratingIncrement;
    } else {
        total_wins_increment = 1;
    }
    
    await sql`
        UPDATE ${sql.table(tables.user)}
        SET 
            rating = rating + ${ratingIncrement},
            total_games_played = total_games_played + 1,
            total_wins = total_wins + ${total_wins_increment}
        WHERE id = ${playerId}
    `.execute(postgresdb.connection());

    return NextResponse.json({
        success: true,
        message: "Player updated successfully"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: 500 }
    );
  }
}