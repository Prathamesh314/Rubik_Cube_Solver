import { NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

// Helper for sending a structured API response
function sendResult(res: any) {
    if (!res || !res.rows || res.rows.length === 0) {
        return NextResponse.json(
            { success: false, message: 'User not found' }, 
            { status: 404 }
        );
    }
    return NextResponse.json(
        { success: true, user: res.rows.length === 1 ? res.rows[0] : res.rows }, 
        { status: 200 }
    );
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');
        const id = searchParams.get('id');

        if (username) {
            return await getUserByUsername(username);
        }
        if (id) {
            return await getUserById(id);
        }
        return await getAllUsers();
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Internal server error', error: String(error) }, 
            { status: 500 }
        );
    }
}

async function getAllUsers() {
    const postgresDb = await dbConnect();

    const exists = await sql`
        SELECT * FROM ${sql.table(tables.user)}
    `.execute(postgresDb.connection());

    return sendResult(exists)
}

async function getUserByUsername(username: string) {
    const postgresDb = await dbConnect();

    const exists = await sql`
        SELECT * FROM ${sql.table(tables.user)}
        WHERE username = ${username}
    `.execute(postgresDb.connection());

    return sendResult(exists)
}

async function getUserById(id: string) {
    const postgresDb = await dbConnect();

    const exists = await sql`
        SELECT * FROM ${sql.table(tables.user)}
        WHERE id = ${id}
    `.execute(postgresDb.connection());

    return sendResult(exists)
}