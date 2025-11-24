import { NextRequest, NextResponse } from "next/server";
import getPostgresConn from "@/db/postgres";
import { tables } from "@/db/postgres";
import {sql} from "kysely"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required input fields
    const { text, type, created_by } = body;
    if (
      !text ||
      typeof text !== "string" ||
      !type ||
      (type !== "feedback" && type !== "bug") ||
      !created_by ||
      typeof created_by !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid request body: require text (string), type (feedback|bug), and created_by (user UUID)" },
        { status: 400 }
      );
    }

    // Get PG connection
    const pg = await getPostgresConn();

    // Insert feedback row using raw SQL
    const result = await sql`
      INSERT INTO ${sql.table(tables.feedback)} (
        text,
        type,
        created_by
      ) VALUES (
        ${text},
        ${type},
        ${created_by}
      )
      RETURNING *
    `.execute(pg.connection());

    const feedback = result.rows?.[0];

    if (!feedback) {
      return NextResponse.json({ error: "Failed to insert feedback" }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
