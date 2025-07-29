import { clearTokenCookie } from '@/utils/jwt';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  clearTokenCookie(res);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}