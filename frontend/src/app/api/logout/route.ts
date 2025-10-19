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
    // Optional: Verify the token before logout (for security/logging purposes)
    const token = req.cookies.token; // Assuming your token cookie is named 'token'
    
    if (token) {
      try {
        // Verify the token is valid before logout
        const decoded = verifyToken(token);
        
        // Optional: Log the logout event or perform any cleanup
        // You could track logout events in database if needed
        if (decoded && decoded.userId) {
          // Optional: Connect to DB only if you need to log logout events
          // const mongoose = await dbConnect();
          // if (mongoose.connection.db) {
          //   // Log logout event, update user last_seen, etc.
          //   await User.findByIdAndUpdate(decoded.userId, {
          //     lastLogout: new Date(),
          //   });
          // }
          
          console.log(`User ${decoded.userId} logged out at ${new Date().toISOString()}`);
        }
      } catch (tokenError) {
        // Token might be expired or invalid, but still proceed with logout
        console.log('Invalid token during logout, proceeding anyway');
      }
    }

    // Clear the authentication cookie
    clearTokenCookie(res);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, still try to clear the cookie
    clearTokenCookie(res);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  }
}