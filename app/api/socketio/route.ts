import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import Pusher from "pusher"
import { sql } from "@/lib/db-direct"
import { logSecurityEvent } from "@/lib/security-logger"

export async function POST(request: Request) {
  try {
    // Get session token from cookies
    const sessionToken = cookies().get("auth_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from session
    const sessions = await sql`
      SELECT s.*, u.id
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = sessions[0].user_id

    // Initialize Pusher server
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    })

    // Get event data from request
    const { event, data } = await request.json()

    // Handle different event types
    switch (event) {
      case "message":
        // Add sender ID to data
        data.senderId = userId
        data.timestamp = new Date().toISOString()

        // Trigger event to recipient's channel
        await pusher.trigger(`private-user-${data.recipientId}`, "message", data)

        // Update message status to delivered
        if (data.messageId) {
          await sql`
            UPDATE messages
            SET status = 'delivered'
            WHERE id = ${data.messageId}
          `
        }
        break

      case "typing":
        // Add user ID to data
        data.userId = userId

        // Get conversation participants
        const participants = await sql`
          SELECT user_id, vendor_id
          FROM conversations
          WHERE id = ${data.conversationId}
        `

        if (participants.length > 0) {
          const conversation = participants[0]
          const recipientId = userId === conversation.user_id ? conversation.vendor_id : conversation.user_id

          // Trigger typing event to recipient's channel
          await pusher.trigger(`private-user-${recipientId}`, "typing", data)
        }
        break

      case "read_receipt":
        // Update message status in database
        if (data.messageId) {
          await sql`
            UPDATE messages
            SET status = 'read', read_at = NOW()
            WHERE id = ${data.messageId}
          `

          // Get message sender
          const messages = await sql`
            SELECT sender_id
            FROM messages
            WHERE id = ${data.messageId}
          `

          if (messages.length > 0) {
            const senderId = messages[0].sender_id

            // Trigger read receipt event to sender's channel
            await pusher.trigger(`private-user-${senderId}`, "read_receipt", data)
          }
        }
        break

      default:
        return NextResponse.json({ error: "Invalid event type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("SocketIO error:", error)

    // Log security event
    await logSecurityEvent("api_error", {
      details: {
        api: "socketio",
        error: error instanceof Error ? error.message : String(error),
      },
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
