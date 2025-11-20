import { NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { selfUserId, addresseeUserId } = data;

    if (!selfUserId || !addresseeUserId) {
      return NextResponse.json(
        { success: false, message: 'Missing selfUserId or addresseeUserId.' },
        { status: 400 }
      );
    }
    if (selfUserId === addresseeUserId) {
      return NextResponse.json(
        { success: false, message: 'Cannot add yourself as a friend.' },
        { status: 400 }
      );
    }

    const postgresDb = await dbConnect();

    // Check if a friendship request already exists (in either direction)
    const existing = await sql`
      SELECT * FROM ${sql.table(tables.friends)}
      WHERE 
        (requester_id = ${selfUserId} AND addressee_id = ${addresseeUserId})
        OR
        (requester_id = ${addresseeUserId} AND addressee_id = ${selfUserId})
    `.execute(postgresDb.connection());

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'A friend request already exists or you are already friends.' },
        { status: 409 }
      );
    }

    // Insert new friendship request with status 'pending'
    await sql`
      INSERT INTO ${sql.table(tables.friends)}
        (requester_id, addressee_id, status, created_at, updated_at)
      VALUES
        (${selfUserId}, ${addresseeUserId}, 'pending', NOW(), NOW())
    `.execute(postgresDb.connection());

    return NextResponse.json(
      { success: true, message: 'Friend request sent.' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to add friend.', error: String(error) },
      { status: 500 }
    );
  }
}

