import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"
import { verifyTOTP } from "@/lib/auth-service"
import { logSecurityEvent } from "@/lib/security-logger"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    // Get session token from cookies
    const sessionToken = cookies().get("auth_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate session
    const sessions = await sql`
      SELECT s.*, u.id as user_id, u.email, u.two_factor_secret
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = sessions[0]
    const userId = session.user_id
    const email = session.email
    const secret = session.two_factor_secret

    if (!secret) {
      return NextResponse.json({ error: "Two-factor authentication not enabled" }, { status: 400 })
    }

    // Verify token
    const isValid = await verifyTOTP(secret, token)

    if (!isValid) {
      // Log failed verification
      await logSecurityEvent({
        userId,
        eventType: "two_factor_disable_failed",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: { email, reason: "Invalid token" },
      })

      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Disable 2FA
    await sql`
      UPDATE users
      SET two_factor_enabled = false,
          two_factor_secret = null,
          two_factor_backup_codes = null
      WHERE id = ${userId}
    `

    // Log 2FA disabled
    await logSecurityEvent({
      userId,
      eventType: "two_factor_disabled",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      details: { email },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("2FA disable error:", error)
    return NextResponse.json({ error: "Failed to disable two-factor authentication" }, { status: 500 })
  }
}
