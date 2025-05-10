import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateSession } from "./lib/stack-auth"

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/new-password",
  "/auth/verify-email",
  "/landing",
  "/home",
]

// Define routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/messages", "/browse", "/vendors", "/notifications", "/sell"]

// Define routes that require vendor role
const vendorRoutes = ["/dashboard/vendor"]

// Define routes that require admin role
const adminRoutes = ["/admin", "/dashboard/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get session token from cookies
  const sessionToken = request.cookies.get("session_token")?.value

  // If no session token and route requires authentication, redirect to login
  if (!sessionToken) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Validate session
  const sessionData = await validateSession(sessionToken)

  // If session is invalid, redirect to login
  if (!sessionData) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Check if route requires vendor role
  const isVendorRoute = vendorRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (isVendorRoute) {
    // Check if user is a vendor
    const isVendor = await checkIfUserIsVendor(sessionData.user.id)

    if (!isVendor) {
      return NextResponse.redirect(new URL("/sell", request.url))
    }
  }

  // Check if route requires admin role
  const isAdminRoute = adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (isAdminRoute) {
    // Check if user is an admin
    const isAdmin = await checkIfUserIsAdmin(sessionData.user.id)

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

async function checkIfUserIsVendor(userId: string | number) {
  try {
    const { sql } = await import("./lib/db-direct")
    const result = await sql`
      SELECT id FROM vendors WHERE user_id = ${userId}
    `
    return result.length > 0
  } catch (error) {
    console.error("Error checking vendor status:", error)
    return false
  }
}

async function checkIfUserIsAdmin(userId: string | number) {
  try {
    const { sql } = await import("./lib/db-direct")
    const result = await sql`
      SELECT role FROM users WHERE id = ${userId} AND role = 'admin'
    `
    return result.length > 0
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export const config = {
  matcher: ["/((?!api/auth/|_next/static|_next/image|favicon.ico).*)"],
}
