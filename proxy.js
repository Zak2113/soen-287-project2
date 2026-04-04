// proxy.js
import { auth } from "@/auth";

// 1. Force the Node.js runtime to allow better-sqlite3 and bcrypt to work


export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // Define which routes are protected
  const isStudentRoute = nextUrl.pathname.startsWith("/student");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = nextUrl.pathname === "/login";

  // 1. If user is logged in and tries to access /login, redirect to their dashboard
  if (isLoginRoute && isLoggedIn) {
    const role = req.auth.user.role;
    return Response.redirect(new URL(role === "admin" ? "/admin" : "/student", nextUrl));
  }

  // 2. If not logged in and trying to access a dashboard, redirect to login
  if ((isStudentRoute || isAdminRoute) && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // 3. Role-Based Access Control (RBAC)
  // Prevent students from accessing admin pages
  if (isAdminRoute && isLoggedIn && req.auth.user.role !== "admin") {
    return Response.redirect(new URL("/student", nextUrl));
  }
  
  // Prevent admins from accessing student-specific layouts (if applicable)
  if (isStudentRoute && isLoggedIn && req.auth.user.role === "admin") {
    return Response.redirect(new URL("/admin", nextUrl));
  }
});

// The matcher tells Next.js which paths to run this "bouncer" on
// This pattern ignores static files, images, and the internal Next.js API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};