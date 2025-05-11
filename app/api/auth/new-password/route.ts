import { NextResponse } from "next/server"
import { sql } from "@/lib/db-direct"
import { hashPassword } from "@/lib/auth"
import { logSecurityEvent } from "@/lib/security-logger"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    // Verify the token is valid
    const passwordResets = await sql`
      SELECT * FROM password_resets 
      WHERE token = ${token} 
      AND expires_at > NOW() 
      AND used = false
    `

    if (passwordResets.length === 0) {
      await logSecurityEvent({
        type: "password_reset_failed",
        description: "Invalid or expired password reset token",
        metadata: { token },
      })
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const passwordReset = passwordResets[0]

    // Hash the new password
    const passwordHash = await hashPassword(password)

    // Update the user's password
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash} 
      WHERE id = ${passwordReset.user_id}
    `

    // Mark the token as used
    await sql`
      UPDATE password_resets 
      SET used = true 
      WHERE id = ${passwordReset.id}
    `

    await logSecurityEvent({
      type: "password_reset_success",
      userId: passwordReset.user_id,
      description: "Password reset successfully",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("New password error:", error)
    await logSecurityEvent({
      type: "password_reset_error",
      description: "Error during password reset",
      metadata: { error: (error as Error).message },
    })
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
