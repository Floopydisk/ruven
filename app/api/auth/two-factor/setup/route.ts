import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"
import { generateSecret, generateQRCode } from "@/lib/auth-service"
import { logSecurityEvent } from "@/lib/security-logger"

export async function POST(request: Request) {
  try {
    // Get session token from cookies
    const sessionToken = cookies().get("auth_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate session
    const sessions = await sql`
      SELECT s.*, u.id as user_id, u.email
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

    // Generate secret
    const secret = await generateSecret()

    // Generate QR code
    const qrCode = await generateQRCode(email, secret)

    // Store secret temporarily
    await sql`
      UPDATE users
      SET two_factor_temp_secret = ${secret}
      WHERE id = ${userId}
    `

    // Log 2FA setup
    await logSecurityEvent({
      userId,
      eventType: "two_factor_setup_initiated",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      details: { email },
    })

    return NextResponse.json({ qrCode, secret })
  } catch (error) {
    console.error("2FA setup error:", error)
    return NextResponse.json({ error: "Failed to set up two-factor authentication" }, { status: 500 })
  }
}
