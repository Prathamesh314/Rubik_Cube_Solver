import { clearTokenCookie, verifyToken } from '@/utils/jwt';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const token = req.cookies.token; // Assuming your token cookie is named 'token'
    
    if (token) {
      try {
        // Verify the token is valid before logout
        const decoded = verifyToken(token);
        
        if (decoded && decoded.userId) {
          
          console.log(`User ${decoded.userId} logged out at ${new Date().toISOString()}`);
        }
      } catch (tokenError) {
        console.log('Invalid token during logout, proceeding anyway');
      }
    }

    clearTokenCookie(res);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    
    clearTokenCookie(res);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  }
}