import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Check if the user has a session cookie
  const sessionCookie = request.cookies.get("auth_session")

  // If the user is not authenticated and trying to access protected routes
  if (
    !sessionCookie &&
    (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname === "/profile")
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If the user is authenticated and trying to access auth pages
  if (
    sessionCookie &&
    (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/register"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile", "/auth/login", "/auth/register"],
}
