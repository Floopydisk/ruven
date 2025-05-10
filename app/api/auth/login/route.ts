import { type NextRequest, NextResponse } from "next/server"
import { loginWithStack, createSession } from "@/lib/stack-auth"
import { logSecurityEvent } from "@/lib/security-logger"
import { sql } from "@/lib/db-direct"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Authenticate user
    const result = await loginWithStack(email, password)

    if (!result.success) {
      // Log failed login attempt
      await logSecurityEvent({
        event_type: "login_failed",
        user_id: null,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        details: `Failed login attempt for email: ${email}`,
      })

      return NextResponse.json({ error: result.error || "Invalid email or password" }, { status: 401 })
    }

    // Check if user is verified
    const userVerification = await sql`
      SELECT email_verified FROM users WHERE id = ${result.userId}
    `

    // Create session
    const session = await createSession(
      result.userId,
      request.headers.get("user-agent") || "unknown",
      request.headers.get("x-forwarded-for") || "unknown",
    )

    // Check if user has a vendor profile
    const vendorCheck = await sql`
      SELECT id FROM vendors WHERE user_id = ${result.userId}
    `

    const isVendor = vendorCheck.length > 0

    // Log successful login
    await logSecurityEvent({
      event_type: "login_success",
      user_id: result.userId,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      details: `Successful login for user ID: ${result.userId}`,
    })

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      isVendor,
      emailVerified: userVerification[0]?.email_verified || false,
    })

    response.cookies.set({
      name: "session_token",
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: session.expiresAt,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
