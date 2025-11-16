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

        // Hash the password before storing
        // bcryptjs is assumed available (like in login route)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        // We'll use hashedPassword instead of plain password below

        // Connect to postgres
        const postgresDb = await dbConnect();

        const exists = await sql`
            SELECT 1 FROM ${sql.table(tables.user)}
            WHERE email = ${email} OR username = ${username}
            LIMIT 1
        `.execute(postgresDb.connection());

        if (exists.rows.length > 0) {
            return NextResponse.json("Email or Username already exists!", { status: 500 });
        }

        await postgresDb.transaction(async (txn) => {
            await sql`
                INSERT INTO ${sql.table(tables.user)} (
                  username,
                  email,
                  password
                ) VALUES (
                  ${username},
                  ${email},
                  ${hashedPassword}
                )
            `.execute(txn)
        });

        return NextResponse.json("User inserted successsfully", { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.toString() || 'Internal server error' }, { status: 500 });
    }
}
