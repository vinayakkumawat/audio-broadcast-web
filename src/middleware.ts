import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'MyJWTSecretkeyforthisapp');

// Add paths that don't require authentication
const publicPaths = ['/login', '/test'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token');

  // Debug logging (remove in production)
  console.log('Middleware called for path:', pathname);
  console.log('Token exists:', !!token);

  // Check if the current path is public
  if (publicPaths.includes(pathname)) {
    // For login page, redirect to home if already authenticated
    if (pathname === '/login' && token) {
      try {
        await jwtVerify(token.value, secret);
        const homeUrl = new URL('/', request.url);
        console.log('Redirecting to home:', homeUrl.toString());
        return NextResponse.redirect(homeUrl);
      } catch {
        // Invalid token, proceed to login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Handle protected routes
  try {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      console.log('No token, redirecting to login:', loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }

    await jwtVerify(token.value, secret);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', request.url);
    console.log('Invalid token, redirecting to login:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};