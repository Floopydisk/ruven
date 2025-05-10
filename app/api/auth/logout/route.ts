import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"
import { logSecurityEvent } from "@/lib/security-logger"

export async function GET(request: Request) {
  try {
    const sessionCookie = cookies().get("auth_session")

    if (sessionCookie) {
      const token = sessionCookie.value

      // Get user ID for logging
      const sessions = await sql`SELECT user_id FROM sessions WHERE token = ${token}`
      const userId = sessions.length > 0 ? sessions[0].user_id : null

      // Delete the session from the database
      await sql`DELETE FROM sessions WHERE token = ${token}`

      // Log the logout event
      if (userId) {
        const userAgent = request.headers.get("user-agent") || ""
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

        await logSecurityEvent({
          userId,
          eventType: "logout",
          ipAddress: ip,
          userAgent,
        })
      }
    }

    // Delete the cookie
    cookies().delete("auth_session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
