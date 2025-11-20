import { NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { selfUserId, addresseeUserId, status } = data;

    if (!selfUserId || !addresseeUserId || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing selfUserId, addresseeUserId, or status.' },
        { status: 400 }
      );
    }

    // Only allow valid statuses; adjust as needed for your business logic
    const allowedStatuses = ['pending', 'accepted', 'declined', 'blocked'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status.' },
        { status: 400 }
      );
    }

    const postgresDb = await dbConnect();
    // Update the friend relationship: match request in either direction
    const result = await sql`
      UPDATE ${sql.table(tables.friends)}
      SET status = ${status}, updated_at = NOW()
      WHERE (
        (requester_id = ${selfUserId} AND addressee_id = ${addresseeUserId})
        OR 
        (requester_id = ${addresseeUserId} AND addressee_id = ${selfUserId})
      )
      RETURNING *
    `.execute(postgresDb.connection());

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No such friendship found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Friendship status updated.', friendship: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update friend status.', error: String(error) },
      { status: 500 }
    );
  }
}
