import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/utils/jwt';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/signup', '/login', '/'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    const signupUrl = new URL('/signup', request.url);
    return NextResponse.redirect(signupUrl);
  }

  // If user has token, verify it
  if (token) {
    try {
      const decoded = verifyToken(token);
      
      // If token is invalid and user is on protected route
      if (!decoded && !isPublicRoute) {
        const signupUrl = new URL('/signup', request.url);
        const response = NextResponse.redirect(signupUrl);
        // Clear invalid token
        response.cookies.delete('authToken');
        return response;
      }

      // If user is authenticated and trying to access login/signup, redirect to dashboard
      if (decoded && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    } catch (error) {
      console.error('Token verification error:', error);
      
      // If token verification fails and user is on protected route
      if (!isPublicRoute) {
        const signupUrl = new URL('/signup', request.url);
        const response = NextResponse.redirect(signupUrl);
        response.cookies.delete('authToken');
        return response;
      }
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif).*)',
  ],
};