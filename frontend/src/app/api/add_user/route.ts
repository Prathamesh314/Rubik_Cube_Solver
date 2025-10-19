import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/modals/user'

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Required fields check (assuming username, email, password are always required)
        const { username, email, password } = body;
        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Connect to MongoDB
        await dbConnect();

        // Check if user already exists by username or email
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Username or email already exists' },
                { status: 409 }
            );
        }

        // Create new user with default values for unspecified fields
        const newUser = new User({
            username,
            email,
            password,
            player_state: body.player_state ?? undefined,
            rating: body.rating ?? undefined,
            total_wins: body.total_wins ?? undefined,
            win_percentage: body.win_percentage ?? undefined,
            top_speed_to_solve_cube: body.top_speed_to_solve_cube ?? undefined,
            createdAt: new Date()
        });

        await newUser.save();

        // never return password back!
        const resultUser = newUser.toObject();

        return NextResponse.json(resultUser, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.toString() || 'Internal server error' }, { status: 500 });
    }
}
