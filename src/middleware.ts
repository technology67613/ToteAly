import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
    const isAdmin = token?.role === "admin";

    // Protect Admin Pages
    if (isAdminPage) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
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
    "/admin/((?!login).*)",
    "/checkout/:path*",
    "/api/admin/:path*",
  ],
};
