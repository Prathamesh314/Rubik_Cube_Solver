import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/utils/jwt';
import dbConnect from '@/db/db';
import User from '@/modals/user';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    const mongoose = await dbConnect();
    
    // Ensure mongoose.connection.db is defined before accessing the collection
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database connection error' 
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Find user by email using Mongoose model
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Return user data (without password)
    const userData = {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      player_state: user.player_state,
      rating: user.rating,
      total_wins: user.total_wins,
      win_percentage: user.win_percentage,
      top_speed_to_solve_cube: user.top_speed_to_solve_cube,
      createdAt: user.createdAt,
    };

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        user: userData,
        token: token,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
    
  } catch (error) {
    console.error('Login error:', error);
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

// Optional: Handle other methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}