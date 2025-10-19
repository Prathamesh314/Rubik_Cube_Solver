import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { generateToken, setTokenCookie } from '@/utils/jwt';
import dbConnect from '@/utils/db';
import User from '@/modals/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to database following your pattern
    const mongoose = await dbConnect();
    
    // Ensure mongoose.connection.db is defined before accessing the collection
    if (!mongoose.connection.db) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection error' 
      });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email using Mongoose model
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Set HTTP-only cookie
    setTokenCookie(res, token);

    // Return user data (without password)
    const userData = {
      _id: user._id.toString(), // Convert ObjectId to string
      email: user.email,
      username: user.username,
      player_state: user.player_state,
      rating: user.rating,
      total_wins: user.total_wins,
      win_percentage: user.win_percentage,
      top_speed_to_solve_cube: user.top_speed_to_solve_cube,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      user: userData,
      token: token, // Optional: include token in response body as well
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
    });
  }
}
