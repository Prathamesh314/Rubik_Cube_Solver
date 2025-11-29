import { NextRequest, NextResponse } from "next/server";
import getPostgresConn from "@/db/postgres";
import { tables } from "@/db/postgres";
import { sql } from "kysely";

export async function GET(req: NextRequest) {
  try {
    // NOTE: Proper admin authentication/authorization should be here!

    // Get PG connection
    const pg = await getPostgresConn();

    // Fetch all feedback with user information
    const result = await sql`
      SELECT 
        f.id,
        f.text,
        f.type,
        f.created_by,
        f.created_at,
        u.username as user_name,
        u.email as user_email
      FROM ${sql.table(tables.feedback)} f
      LEFT JOIN ${sql.table(tables.user)} u ON f.created_by = u.id
      ORDER BY f.created_at DESC
    `.execute(pg.connection());

    return NextResponse.json({
      success: true,
      feedback: result.rows,
    });
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch feedback",
        error: String(error?.message || error),
      },
      { status: 500 }
    );
  }
}