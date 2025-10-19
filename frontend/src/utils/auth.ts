
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from './jwt';
import dbConnect from './db';
import User from '@/modals/user';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

export default function authMiddleware(handler: Function) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      await dbConnect();

      // Get token from cookies (support both API and app router)
      let token: string | undefined;

      // For Next.js API routes (pages/api)
      if (req.cookies && req.cookies.authToken) {
        token = req.cookies.authToken;
      }
      // For Next.js app router (app/api) - cookies may be in headers
      else if (req.headers && req.headers.cookie) {
        // Parse cookies from header
        const cookies = req.headers.cookie.split(';').reduce((acc: any, cookie: string) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = decodeURIComponent(value);
          return acc;
        }, {});
        token = cookies.authToken;
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, no token',
        });
      }

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, invalid token',
        });
      }

      // Find user and attach to request
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}