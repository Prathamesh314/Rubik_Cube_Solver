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
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
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