import { NextResponse } from "next/server";
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

// Accept only POST requests for deleting a friend entry
export async function POST(request: Request) {
  try {
    const { selfUserId, addresseeUserId } = await request.json();

    if (!selfUserId || !addresseeUserId) {
      return NextResponse.json({ success: false, message: "Missing user IDs" }, { status: 400 });
    }

    const postgresDb = await dbConnect();

    // Delete the friendship in both directions for safety
    await sql`
      DELETE FROM ${sql.table(tables.friends)}
      WHERE 
        (requester_id = ${selfUserId} AND addressee_id = ${addresseeUserId})
        OR
        (requester_id = ${addresseeUserId} AND addressee_id = ${selfUserId})
    `.execute(postgresDb.connection());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error in deleting friend: ", error)
    return NextResponse.json({ success: false, message: "Failed to delete friend" }, { status: 500 });
  }
}
