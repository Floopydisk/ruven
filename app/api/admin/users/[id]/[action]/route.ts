import { NextResponse } from "next/server"
import { sql } from "@/lib/db-direct"
import { cookies } from "next/headers"
import crypto from "crypto"
import bcrypt from "bcryptjs"

export async function POST(request: Request, { params }: { params: { id: string; action: string } }) {
  try {
    // Verify admin status
    const sessionCookie = cookies().get("auth_session")
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = sessionCookie.value
    const sessions = await sql`
      SELECT s.*, u.role FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `

    if (sessions.length === 0 || sessions[0].role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    const action = params.action

    // Get user
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Log admin action
    const adminId = sessions[0].user_id
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || ""

    await sql`
      INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, details)
      VALUES (
        ${adminId}, 
        'admin_action', 
        ${ip}, 
        ${userAgent}, 
        ${JSON.stringify({ action, targetUserId: userId })}
      )
    `

    // Perform action
    switch (action) {
      case "reset-password": {
        // Generate random password
        const newPassword = crypto.randomBytes(8).toString("hex")
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE id = ${userId}`

        // TODO: Send email with new password

        return NextResponse.json({
          success: true,
          message: `Password reset to: ${newPassword}`,
        })
      }

      case "verify-email": {
        await sql`UPDATE users SET email_verified = true WHERE id = ${userId}`
        return NextResponse.json({
          success: true,
          message: "Email verified",
        })
      }

      case "make-admin": {
        await sql`UPDATE users SET role = 'admin' WHERE id = ${userId}`
        return NextResponse.json({
          success: true,
          message: "User is now an admin",
        })
      }

      case "delete": {
        // Delete user's sessions
        await sql`DELETE FROM sessions WHERE user_id = ${userId}`

        // Delete user
        await sql`DELETE FROM users WHERE id = ${userId}`

        return NextResponse.json({
          success: true,
          message: "User deleted",
        })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Admin action error:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}
