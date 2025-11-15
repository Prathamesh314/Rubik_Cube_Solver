import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/modals/user'; 

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
        await dbConnect();
        const users = await User.find({}, "-password -__v").lean();
        return NextResponse.json(users, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.toString() }, { status: 500 });
    }
}

async function getUserByUsername(username: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ username }).select("-password -__v").lean();
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
        await dbConnect();

        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ error: 'Invalid user id format' }, { status: 400 });
        }        
        const user = await User.findById(id).select("-password -__v").lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.toString() }, { status: 500 });
    }
}