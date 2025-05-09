import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"

export async function GET() {
  try {
    const sessionToken = cookies().get("auth_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null })
    }

    // Find valid session using tagged template syntax
    const sessions = await sql`SELECT * FROM sessions WHERE token = ${sessionToken} AND expires_at > NOW()`

    if (sessions.length === 0) {
      return NextResponse.json({ user: null })
    }

    // Get user from session
    const userId = sessions[0].user_id
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`

    if (users.length === 0) {
      return NextResponse.json({ user: null })
    }

    const user = users[0]
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image,
      },
    })
  } catch (error) {
    console.error("Error fetching current user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
