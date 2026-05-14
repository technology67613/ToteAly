import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdmin = token?.role === "admin";
    
    const pathname = req.nextUrl.pathname;
    const isAdminPage = pathname.startsWith("/admin");
    const isAdminApi = pathname.startsWith("/api/admin");
    const isLoginRoute = pathname.startsWith("/admin/login");

    // Protect Admin Pages
    if (isAdminPage && !isLoginRoute) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Protect Admin API
    if (isAdminApi) {
      if (!isAuth || !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    "/admin/:path*",
    "/checkout/:path*",
    "/api/admin/:path*",
  ],
};
