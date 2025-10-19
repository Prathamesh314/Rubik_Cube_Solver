import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken, setTokenCookie } from '@/utils/jwt';
import dbConnect from '@/utils/db';
import User from '@/modals/user';

export async function POST(req: NextRequest) {
  try {
    // Connect to database following your pattern
    const mongoose = await dbConnect();
    
    // Ensure mongoose.connection.db is defined before accessing the collection
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection error' 
        },
        { status: 500 }
      );
    }

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
    console.log("Existing user: ", existingUser);
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
      player_state: 'active', // Default value from reference
      rating: 0,
      total_wins: 0,
      win_percentage: 0,
      top_speed_to_solve_cube: null,
      createdAt: new Date(),
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id.toString());

    // Return user data (without password)
    const userData = {
      _id: newUser._id.toString(), // Convert ObjectId to string
      email: newUser.email,
      username: newUser.username,
      player_state: newUser.player_state,
      rating: newUser.rating,
      total_wins: newUser.total_wins,
      win_percentage: newUser.win_percentage,
      top_speed_to_solve_cube: newUser.top_speed_to_solve_cube,
      createdAt: newUser.createdAt,
    };

    // Set HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        user: userData,
        token: token, // Optional: include token in response body as well
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
        error: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: 500 }
    );
  }
}
