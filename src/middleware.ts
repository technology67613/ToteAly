import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isMaintenancePage = request.nextUrl.pathname === '/maintenance.html';

  // Protect admin routes
  if (isAdminRoute && !isLoginPage) {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // If already logged in as admin, don't show login page
  if (isLoginPage && token?.role === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // --- Maintenance Mode Check ---
  // Only check for public storefront routes (not admin, api, or the maintenance page itself)
  if (!isAdminRoute && !isApiRoute && !isMaintenancePage && request.nextUrl.pathname !== '/_next/image' && !request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)) {
    try {
      // Check if user is admin (allow admins to view storefront even in maintenance)
      if (token?.role !== 'admin') {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'maintenance_mode')
            .single();

          if (data && (data.value === 'true' || data.value === true)) {
            return NextResponse.rewrite(new URL('/maintenance.html', request.url));
          }
        }
      }
    } catch (e) {
      console.error('Middleware Maintenance Check Error:', e);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
