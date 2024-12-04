import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'MyJWTSecretkeyforthisapp');

// Add paths that don't require authentication
const publicPaths = ['/login', '/test'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is public
  if (publicPaths.includes(pathname)) {
    // For login page, redirect to home if already authenticated
    if (pathname === '/login') {
      const token = request.cookies.get('auth-token');
      if (token) {
        try {
          await jwtVerify(token.value, secret);
          return NextResponse.redirect(new URL('/', request.url));
        } catch {
          return NextResponse.next();
        }
      }
    }
    return NextResponse.next();
  }

  // Handle protected routes
  const token = request.cookies.get('auth-token');
  
  try {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    await jwtVerify(token.value, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};