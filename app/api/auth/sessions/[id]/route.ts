import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"
import { logSecurityEvent } from "@/lib/security-logger"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = Number.parseInt(params.id)
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

    // Get the session to be terminated
    const targetSessions = await sql`
      SELECT token FROM sessions WHERE id = ${sessionId}
    `

    if (targetSessions.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Check if the session belongs to the user
    const sessionOwnership = await sql`
      SELECT id FROM sessions WHERE id = ${sessionId} AND user_id = ${userId}
    `

    if (sessionOwnership.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if trying to terminate the current session
    if (targetSessions[0].token === token) {
      return NextResponse.json({ error: "Cannot terminate current session" }, { status: 400 })
    }

    // Delete the session
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`

    // Log the action
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    await logSecurityEvent({
      userId,
      eventType: "session_terminated",
      ipAddress: ip,
      userAgent,
      details: { sessionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error terminating session:", error)
    return NextResponse.json({ error: "Failed to terminate session" }, { status: 500 })
  }
}
