import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define paths that need protection
const protectedPaths = ['/admin', '/api/admin'];

// Define paths that should bypass protection (login page, auth API)
const publicPaths = ['/admin/login', '/api/admin/auth'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if it's a protected path
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));
  const isPublicPath = publicPaths.some((p) => path.startsWith(p));

  // If it's not protected or it's explicitly public, let it pass
  if (!isProtectedPath || isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_session')?.value;

  // 1. Check if token exists
  if (!token) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    // 2. Verify token
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      throw new Error('ADMIN_JWT_SECRET is not defined');
    }

    const encodedSecret = new TextEncoder().encode(secret);
    await jwtVerify(token, encodedSecret);

    // 3. Token is valid, allow request
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware JWT verification failed:', error);
    
    // Invalid token, redirect to login or return 401
    const response = path.startsWith('/api/') 
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/admin/login', request.url));
      
    // Clear the invalid cookie
    response.cookies.delete('admin_session');
    
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
