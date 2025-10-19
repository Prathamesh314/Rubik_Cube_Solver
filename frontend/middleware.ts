import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/utils/jwt';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Define routes that are always accessible (like homepage)
  const alwaysAccessible = ['/'];
  const isAlwaysAccessible = alwaysAccessible.includes(pathname);

  // Allow always accessible routes for everyone
  if (isAlwaysAccessible) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user has token, verify it
  if (token) {
    try {
      const decoded = verifyToken(token);
      
      // If token is invalid
      if (!decoded) {
        // Clear invalid token
        const response = isPublicRoute 
          ? NextResponse.next() 
          : NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('authToken');
        return response;
      }

      // If user is authenticated and trying to access login/signup, redirect to home
      if (decoded && isPublicRoute) {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
      }

      // User is authenticated and accessing valid route
      return NextResponse.next();
      
    } catch (error) {
      console.error('Token verification error:', error);
      
      // If token verification fails
      const response = isPublicRoute 
        ? NextResponse.next() 
        : NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('authToken');
      return response;
    }
  }

  // Allow public routes without token
  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|.*\\.ico|.*\\.webp).*)',
  ],
};