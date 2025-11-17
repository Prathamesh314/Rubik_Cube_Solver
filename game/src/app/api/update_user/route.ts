import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import {
    sql
} from 'kysely'
import { success } from 'zod';

export async function PATCH(req: NextRequest) {
  try {
    const postgresdb = await dbConnect();

    const body = await req.json();
    const { playerId, ratingIncrement } = body;

    await sql`
        UPDATE ${sql.table(tables.user)}
        SET rating = rating + ${ratingIncrement}
        WHERE id = ${playerId}
    `.execute(postgresdb.connection());

    return NextResponse.json({
        success: true,
        message: "Player updated successfully"
    }, {status: 201})
    
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

