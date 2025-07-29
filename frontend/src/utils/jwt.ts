import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET as string;
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local');
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: MAX_AGE,
  });
}

export function setTokenCookie(res: any, token: string) {
  const cookie = serialize('authToken', token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

export function clearTokenCookie(res: any) {
  const cookie = serialize('authToken', '', {
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}