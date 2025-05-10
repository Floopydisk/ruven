import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"
import { verifyTOTP } from "@/lib/stack-auth"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    const twoFactorPending = cookies().get("two_factor_pending")

    if (!twoFactorPending) {
      return NextResponse.json({ error: "No 2FA session pending" }, { status: 400 })
    }

    const userId = Number.parseInt(twoFactorPending.value)

    // Get user's 2FA secret
    const users = await sql`
      SELECT * FROM users WHERE id = ${userId} AND two_factor_enabled = true
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found or 2FA not enabled" }, { status: 400 })
    }

    const user = users[0]

    // Check if it's a backup code
    if (user.two_factor_backup_codes && Array.isArray(user.two_factor_backup_codes)) {
      const backupCodeIndex = user.two_factor_backup_codes.indexOf(code)
      if (backupCodeIndex !== -1) {
        // Remove the used backup code
        const updatedBackupCodes = [...user.two_factor_backup_codes]
        updatedBackupCodes.splice(backupCodeIndex, 1)

        await sql`
          UPDATE users 
          SET two_factor_backup_codes = ${JSON.stringify(updatedBackupCodes)}
          WHERE id = ${userId}
        `

        // Create session
        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

        const userAgent = request.headers.get("user-agent") || ""
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

        await sql`
          INSERT INTO sessions (user_id, token, expires_at, user_agent, ip_address, last_active)
          VALUES (${userId}, ${token}, ${expiresAt.toISOString()}, ${userAgent}, ${ip}, NOW())
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

        // Delete the 2FA pending cookie
        cookies().delete("two_factor_pending")

        // Check if user is a vendor
        const vendors = await sql`SELECT * FROM vendors WHERE user_id = ${userId}`
        const isVendor = vendors.length > 0

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            profileImage: user.profile_image,
          },
          isVendor,
        })
      }
    }

    // Verify TOTP code
    const isValid = await verifyTOTP(user.two_factor_secret, code)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Create session
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    await sql`
      INSERT INTO sessions (user_id, token, expires_at, user_agent, ip_address, last_active)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()}, ${userAgent}, ${ip}, NOW())
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

    // Delete the 2FA pending cookie
    cookies().delete("two_factor_pending")

    // Check if user is a vendor
    const vendors = await sql`SELECT * FROM vendors WHERE user_id = ${userId}`
    const isVendor = vendors.length > 0

    // Log successful 2FA verification
    await sql`
      INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, details)
      VALUES (${userId}, 'two_factor_success', ${ip}, ${userAgent}, 'Successful 2FA verification')
    `

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image,
      },
      isVendor,
    })
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
