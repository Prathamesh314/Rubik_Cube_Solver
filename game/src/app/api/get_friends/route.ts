import { NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

// Utility function to shape friend data (matches frontend type)
function shapeFriend(row: any) {
  return {
    id: String(row.id),
    name: row.name,
    username: row.username,
    rating: row.rating ?? undefined,
    bestTime: row.best_time ?? undefined,
    status: row.status as "online" | "offline" | "busy"
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId parameter." },
        { status: 400 }
      );
    }

    const postgresDb = await dbConnect();
    // The "friends" relationship: assume there is a "friends" table with (user_id, friend_id)
    // and user table has id, name, username, rating, best_time, status
    // The friends table schema is (id, requester_id, addressee_id, status, ...)
    // We want to get all accepted friendships for the given user, whether user is requester or addressee
    const res = await sql`
      SELECT 
        u.id, u.username, u.rating, 
        u.fastest_time_to_solve_cube AS best_time,
        'offline' AS status,  -- Placeholder, adjust according to your presence logic if available
        u.username AS name -- Use username as name since schema lacks a "name" field
      FROM ${sql.table(tables.friends)} f
      JOIN ${sql.table(tables.user)} u
        ON u.id = 
          CASE
            WHEN f.requester_id = ${userId} THEN f.addressee_id
            ELSE f.requester_id
          END
      WHERE (f.requester_id = ${userId} OR f.addressee_id = ${userId})
        AND f.status = 'accepted'
    `.execute(postgresDb.connection());

    // Always return an array
    const friends = res?.rows?.map(shapeFriend) ?? [];

    return NextResponse.json({ friends });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
