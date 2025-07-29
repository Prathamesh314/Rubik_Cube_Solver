
import bcrypt from 'bcryptjs';
import dbConnect  from '@/utils/db';
import { generateToken, setTokenCookie } from '@/utils/jwt';
import User from '@/app/models/user';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const { email, password, username } = body;

        // Validate input
        if (!email || !password || !username) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email, username, and password are required',
                },
                { status: 400 }
            );
        }

        // Check password length
        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Password must be at least 6 characters',
                },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        console.log("Existing user: ", existingUser)
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email already in use',
                },
                { status: 400 }
            );
        }

        // Check if username is taken
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Username already taken',
                },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
            bestTime: null, // Initial game stats
            createdAt: new Date(),
        });

        await newUser.save();

        // Generate JWT token
        const token = generateToken(newUser._id.toString());

        // Set HTTP-only cookie
        const response = NextResponse.json(
            {
                success: true,
                user: {
                    _id: newUser._id,
                    email: newUser.email,
                    username: newUser.username,
                    bestTime: newUser.bestTime,
                },
            },
            { status: 201 }
        );
        setTokenCookie(response, token);

        return response;
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}

// Optionally, handle other HTTP methods if needed
export async function GET() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );
}