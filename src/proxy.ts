import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    
    const pathname = req.nextUrl.pathname;
    const isAdminPage = pathname.startsWith("/admin");
    const isLoginRoute = pathname.startsWith("/admin/login");

    // Only redirect to login if trying to access admin pages while not authenticated
    if (isAdminPage && !isLoginRoute && !isAuth) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Let the function above handle the logic
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
