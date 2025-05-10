import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db-direct"
import { logSecurityEvent } from "@/lib/security-logger"

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)
    const { currentPassword, newPassword } = await request.json()

    // Get session token from cookies
    const sessionToken = cookies().get("auth_session")?.value
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify session belongs to the user
    const sessions = await sql`
      SELECT * FROM sessions 
      WHERE token = ${sessionToken} 
      AND user_id = ${userId} 
      AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!passwordValid) {
      // Log failed password change attempt
      await logSecurityEvent({
        userId,
        eventType: "password_change_failed",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: { reason: "Current password invalid" },
      })

      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await sql`UPDATE users SET password_hash = ${newPasswordHash} WHERE id = ${userId}`

    // Log successful password change
    await logSecurityEvent({
      userId,
      eventType: "password_changed",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
