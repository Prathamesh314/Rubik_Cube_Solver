import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/utils/jwt';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

export async function POST(request: NextRequest) {
  try {
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

    // Connect to postgres
    const postgresDb = await dbConnect();

    // Find user by email
    interface User {
      id: string;
      username: string;
      email: string;
      password: string;
      rating: number;
      total_games_played: number;
      fastest_time_to_solve_cube: number;
      created_at: Date
    }
    
    const result = await sql<User>`
      SELECT * FROM ${sql.table(tables.user)}
      WHERE email = ${email}
      LIMIT 1
    `.execute(postgresDb.connection());

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 401 }
      );
    }

    // Check password (use bcrypt to compare stored hash and provided password)
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

    // Generate JWT token (using user id from postgres)
    const token = generateToken(user.id);

    // Prepare user data (exclude password)
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      rating: user.rating,
      total_games_played: user.total_games_played,
      fastest_time_to_solve_cube: user.fastest_time_to_solve_cube,
      created_at: user.created_at,
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