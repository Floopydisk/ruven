import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sql } from "@/lib/db-direct"
import { logSecurityEvent } from "@/lib/security-logger"
import { rateLimit } from "@/middleware/rate-limit"

export async function POST(request: Request) {
  try {
    // Get IP and user agent for rate limiting and logging
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Check rate limiting
    const rateLimitResponse = await rateLimit(request, "login")
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { email, password } = await request.json()

    // Log login attempt
    await logSecurityEvent({
      eventType: "login_attempt",
      ipAddress: ip,
      userAgent,
      details: { email },
    })

    // Find user using tagged template syntax
    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    if (users.length === 0) {
      // Log failed login
      await logSecurityEvent({
        eventType: "login_failed",
        ipAddress: ip,
        userAgent,
        details: { email, reason: "User not found" },
      })

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash)
    if (!passwordValid) {
      // Log failed login
      await logSecurityEvent({
        userId: user.id,
        eventType: "login_failed",
        ipAddress: ip,
        userAgent,
        details: { reason: "Invalid password" },
      })

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Set a temporary cookie to indicate 2FA is pending
      cookies().set({
        name: "two_factor_pending",
        value: user.id.toString(),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
      })

      // Log 2FA challenge
      await logSecurityEvent({
        userId: user.id,
        eventType: "two_factor_challenge",
        ipAddress: ip,
        userAgent,
        details: { email },
      })

      return NextResponse.json({
        requiresTwoFactor: true,
        userId: user.id,
      })
    }

    // Create session
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await sql`
      INSERT INTO sessions (user_id, token, expires_at, user_agent, ip_address, last_active)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()}, ${userAgent}, ${ip}, NOW())
    `

    // Set session cookie
    cookies().set({
      name: "auth_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    // Check if user is a vendor
    const vendors = await sql`SELECT * FROM vendors WHERE user_id = ${user.id}`
    const isVendor = vendors.length > 0

    // Log successful login
    await logSecurityEvent({
      userId: user.id,
      eventType: "login_success",
      ipAddress: ip,
      userAgent,
      details: { email },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        profileImage: user.profile_image,
        role: user.role,
        emailVerified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        isVendor: isVendor,
      },
      isVendor,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
