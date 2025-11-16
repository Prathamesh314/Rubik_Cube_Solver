import { NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import {
    sql,
} from 'kysely';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email, password } = body;
        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Connect to postgres
        const postgresDb = await dbConnect();

        await postgresDb.transaction(async (txn) => {
            await sql`
                INSERT INTO ${sql.table(tables.user)} (
                    username,
                    email,
                    password
                ) VALUES (
                    ${username},
                    ${email},
                    ${password}
                )
            `.execute(txn)
        });

        return NextResponse.json("User inserted successsfully", { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.toString() || 'Internal server error' }, { status: 500 });
    }
}
