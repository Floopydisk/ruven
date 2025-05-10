import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user is authenticated by looking for the auth_session cookie
  const isAuthenticated = request.cookies.has("auth_session")

  // Skip middleware for API routes and static assets
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes("/favicon.ico")) {
    return NextResponse.next()
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/landing", "/auth/login", "/auth/register", "/auth/reset-password", "/home"]

  // Routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile", "/messages", "/sell", "/browse", "/notifications"]

  // Redirect root to home for authenticated users
  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Check if the current route requires authentication
  const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route))

  // If route requires authentication and user is not authenticated, redirect to login
  if (requiresAuth && !isAuthenticated) {
    const redirectUrl = new URL("/auth/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Prevent authenticated users from accessing login/register pages
  if ((pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
