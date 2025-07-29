import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { generateToken, setTokenCookie } from '@/utils/jwt';
import dbConnect from '@/utils/db';
import User from '@/app/models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
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
      _id: user._id,
      email: user.email,
      username: user.fullName,
      bestTime: user.bestTime,
    };

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}