import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import Pusher from "pusher"
import { sql } from "@/lib/db-direct"

export async function POST(request: Request) {
  try {
    // Get session token from cookies
    const sessionToken = cookies().get("auth_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from session
    const sessions = await sql`
      SELECT s.*, u.id, u.email, u.first_name, u.last_name
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = sessions[0]

    // Initialize Pusher server
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    })

    // Get socket ID and channel name from request
    const formData = await request.formData()
    const socketId = formData.get("socket_id") as string
    const channel = formData.get("channel_name") as string

    // Authorize the connection
    if (channel.startsWith("presence-")) {
      // For presence channels, include user data
      const authResponse = pusher.authorizeChannel(socketId, channel, {
        user_id: user.id.toString(),
        user_info: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
        },
      })
      return NextResponse.json(authResponse)
    } else if (channel.startsWith("private-")) {
      // For private channels, just authorize
      const authResponse = pusher.authorizeChannel(socketId, channel)
      return NextResponse.json(authResponse)
    }

    return NextResponse.json({ error: "Invalid channel type" }, { status: 400 })
  } catch (error) {
    console.error("Pusher auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
