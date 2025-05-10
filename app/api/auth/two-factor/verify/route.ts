import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { sql } from "@/lib/db-direct"
import { verifyTOTP, generateBackupCodes } from "@/lib/auth-service"
import { logSecurityEvent } from "@/lib/security-logger"

export async function POST(request: Request) {
  try {
    const { token, userId } = await request.json()

    // Check if we have a pending 2FA authentication
    const pendingUserId = cookies().get("two_factor_pending")?.value

    // If we have a userId from the request, use that (for setup)
    // Otherwise, use the pending userId from the cookie (for login)
    const targetUserId = userId || pendingUserId

    if (!targetUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user
    const users = await sql`
      SELECT * FROM users WHERE id = ${targetUserId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = users[0]

    // Determine which secret to use
    const secret = userId ? user.two_factor_temp_secret : user.two_factor_secret

    if (!secret) {
      return NextResponse.json({ error: "Two-factor authentication not set up" }, { status: 400 })
    }

    // Verify token
    const isValid = await verifyTOTP(secret, token)

    if (!isValid) {
      // Check if it's a backup code
      const backupCodes = user.two_factor_backup_codes || []
      const backupCodeIndex = backupCodes.indexOf(token)

      if (backupCodeIndex === -1) {
        // Log failed verification
        await logSecurityEvent({
          userId: user.id,
          eventType: "two_factor_verification_failed",
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          details: { reason: "Invalid token" },
        })

        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
      }

      // Remove used backup code
      backupCodes.splice(backupCodeIndex, 1)

      await sql`
        UPDATE users
        SET two_factor_backup_codes = ${JSON.stringify(backupCodes)}
        WHERE id = ${user.id}
      `
    }

    // If this is a setup verification
    if (userId) {
      // Generate backup codes
      const backupCodes = await generateBackupCodes()

      // Enable 2FA
      await sql`
        UPDATE users
        SET two_factor_enabled = true,
            two_factor_secret = ${user.two_factor_temp_secret},
            two_factor_temp_secret = null,
            two_factor_backup_codes = ${JSON.stringify(backupCodes)}
        WHERE id = ${userId}
      `

      // Log 2FA setup
      await logSecurityEvent({
        userId: user.id,
        eventType: "two_factor_enabled",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: { email: user.email },
      })

      return NextResponse.json({ success: true, backupCodes })
    } else {
      // This is a login verification
      // Create session
      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

      await sql`
        INSERT INTO sessions (user_id, token, expires_at, user_agent, ip_address, last_active)
        VALUES (${user.id}, ${token}, ${expiresAt.toISOString()}, ${
          request.headers.get("user-agent") || "unknown"
        }, ${request.headers.get("x-forwarded-for") || "unknown"}, NOW())
      `

      // Clear the pending 2FA cookie
      cookies().delete("two_factor_pending")

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
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: { email: user.email, twoFactorUsed: true },
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          profileImage: user.profile_image,
          role: user.role,
          emailVerified: user.email_verified,
          twoFactorEnabled: user.two_factor_enabled,
        },
        isVendor,
      })
    }
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json({ error: "Failed to verify two-factor authentication" }, { status: 500 })
  }
}
