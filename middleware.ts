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

  // Redirect root to home for authenticated users
  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login?redirect=" + encodeURIComponent(pathname), request.url))
  }

  // Protect profile routes
  if (pathname.startsWith("/profile") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login?redirect=" + encodeURIComponent(pathname), request.url))
  }

  // Protect messages routes
  if (pathname.startsWith("/messages") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login?redirect=" + encodeURIComponent(pathname), request.url))
  }

  // Protect sell route
  if (pathname.startsWith("/sell") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login?redirect=" + encodeURIComponent(pathname), request.url))
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
