import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'MyJWTSecretkeyforthisapp');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const isLoginPage = request.nextUrl.pathname === '/login';

  try {
    if (token) {
      // Verify token
      await jwtVerify(token.value, secret);
      
      // If token is valid and trying to access login page, redirect to home
      if (isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Allow access to other pages
      return NextResponse.next();
    }

    // No token present
    if (!isLoginPage) {
      // Redirect to login if accessing protected routes
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow access to login page when not authenticated
    return NextResponse.next();
  } catch {
    // Invalid token
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};