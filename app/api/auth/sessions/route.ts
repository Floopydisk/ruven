import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"
import { logSecurityEvent } from "@/lib/security-logger"

export async function GET(request: Request) {
  try {
    const sessionCookie = cookies().get("auth_session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = sessionCookie.value

    // Get user ID from the session
    const sessions = await sql`
      SELECT user_id FROM sessions WHERE token = ${token} AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const userId = sessions[0].user_id

    // Get all active sessions for the user
    const activeSessions = await sql`
      SELECT id, token, user_agent, ip_address, last_active, created_at, expires_at
      FROM sessions
      WHERE user_id = ${userId} AND expires_at > NOW()
      ORDER BY last_active DESC
    `

    return NextResponse.json({ sessions: activeSessions })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionCookie = cookies().get("auth_session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = sessionCookie.value

    // Get user ID from the session
    const sessions = await sql`
      SELECT user_id FROM sessions WHERE token = ${token} AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const userId = sessions[0].user_id

    // Delete all other sessions for the user
    await sql`
      DELETE FROM sessions 
      WHERE user_id = ${userId} AND token != ${token}
    `

    // Log the action
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    await logSecurityEvent({
      userId,
      eventType: "session_terminated",
      ipAddress: ip,
      userAgent,
      details: { action: "terminate_all" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error terminating sessions:", error)
    return NextResponse.json({ error: "Failed to terminate sessions" }, { status: 500 })
  }
}
