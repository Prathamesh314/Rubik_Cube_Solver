import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken, setTokenCookie } from '@/utils/jwt';
import dbConnect from '@/utils/db';
import User from '@/modals/user';
import {PlayerState} from '@/modals/player'

export async function POST(req: NextRequest) {
  try {
    const mongoose = await dbConnect();
    
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

    if (!email || !password || !username) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email, username, and password are required',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 6 characters',
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email already in use',
        },
        { status: 400 }
      );
    }

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      rating: 1000,
      total_wins: 0,
      win_percentage: 0,
      top_speed_to_solve_cube: null,
      createdAt: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })),
    });

    await newUser.save();

    const token = generateToken(newUser._id.toString());

    const userData = {
      email: newUser.email,
      username: newUser.username,
      player_state: newUser.player_state ?? PlayerState.NotPlaying,
      rating: newUser.rating,
      total_wins: newUser.total_wins,
      win_percentage: newUser.win_percentage,
      top_speed_to_solve_cube: newUser.top_speed_to_solve_cube,
      createdAt: newUser.createdAt,
    };

    const response = NextResponse.json(
      {
        success: true,
        user: userData,
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
