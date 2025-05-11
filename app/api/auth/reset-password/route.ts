import { NextResponse } from "next/server"
import { sql } from "@/lib/db-direct"
import crypto from "crypto"
import { sendEmail } from "@/lib/email-service"
import { logSecurityEvent } from "@/lib/security-logger"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const users = await sql`SELECT id, email FROM users WHERE email = ${email}`

    if (users.length === 0) {
      // Don't reveal if user exists or not for security reasons
      return NextResponse.json({ success: true })
    }

    const user = users[0]

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Store the token in the database
    await sql`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/new-password?token=${token}`

    // Send password reset email
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })

    // Log security event
    await logSecurityEvent({
      userId: user.id,
      action: "password_reset_requested",
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      details: { email },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 })
  }
}
