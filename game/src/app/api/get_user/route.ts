import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/utils/db';

const USER_COLLECTION = 'User';

export async function GET(request: Request) {
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
}

async function getAllUsers() {
    try {
        // dbConnect now returns a Mongoose instance
        const mongoose = await dbConnect();
        // Ensure mongoose.connection.db is defined before accessing the collection
        if (!mongoose.connection.db) {
            return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
        }
        // Access the native MongoDB collection through the Mongoose connection
        const users = await mongoose.connection.db.collection(USER_COLLECTION).find({}).toArray();
        return NextResponse.json(users, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.toString() }, { status: 500 });
    }
}

async function getUserByUsername(username: string) {
    try {
        const mongoose = await dbConnect();
        // Ensure mongoose.connection.db is defined before accessing the collection
        if (!mongoose.connection.db) {
            return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
        }
        const user = await mongoose.connection.db.collection(USER_COLLECTION).findOne({ username });
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.toString() }, { status: 500 });
    }
}

async function getUserById(id: string) {
    try {
        const mongoose = await dbConnect();
        let _id: ObjectId;

        // Validate the ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid user id format' }, { status: 400 });
        }
        _id = new ObjectId(id);

        // Ensure mongoose.connection.db is defined before accessing the collection
        if (!mongoose.connection.db) {
            return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
        }
        const user = await mongoose.connection.db.collection(USER_COLLECTION).findOne({ _id });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.toString() }, { status: 500 });
    }
}