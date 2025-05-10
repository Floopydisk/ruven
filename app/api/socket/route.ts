import { Server } from "socket.io"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

// Store for active connections
const connectedUsers = new Map()
const typingUsers = new Map()

export async function GET(req: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { headers } = req
  const upgradeHeader = headers.get("upgrade")

  if (upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade to WebSocket", { status: 426 })
  }

  try {
    // Create a new Socket.IO server
    const io = new Server({
      path: "/api/socket",
      addTrailingSlash: false,
    })

    // Add user to connected users
    connectedUsers.set(user.id, io)

    // Handle socket events
    io.on("connection", (socket) => {
      console.log(`User ${user.id} connected`)

      socket.on("message", async (data) => {
        try {
          const { conversationId, recipientId, message, messageId } = data

          // Get conversation details
          const conversations = await sql`
            SELECT user_id, vendor_id FROM conversations WHERE id = ${conversationId}
          `

          if (conversations.length === 0) {
            return
          }

          const conversation = conversations[0]
          const targetUserId = user.id === conversation.user_id ? conversation.vendor_id : conversation.user_id

          // Emit to recipient if they're connected
          if (connectedUsers.has(targetUserId)) {
            connectedUsers.get(targetUserId).emit("message", {
              conversationId,
              senderId: user.id,
              message,
              messageId,
              timestamp: new Date().toISOString(),
              status: "delivered",
            })
          }

          // Send notification
          if (connectedUsers.has(targetUserId)) {
            connectedUsers.get(targetUserId).emit("notification", {
              type: "message",
              conversationId,
              senderId: user.id,
              message,
              timestamp: new Date().toISOString(),
            })
          }

          // Update message status to delivered
          await sql`
            UPDATE messages 
            SET status = 'delivered', delivered_at = NOW() 
            WHERE id = ${messageId}
          `
        } catch (error) {
          console.error("Error handling message:", error)
        }
      })

      socket.on("typing", async (data) => {
        try {
          const { conversationId, isTyping } = data

          // Get conversation details
          const conversations = await sql`
            SELECT user_id, vendor_id FROM conversations WHERE id = ${conversationId}
          `

          if (conversations.length === 0) {
            return
          }

          const conversation = conversations[0]
          const targetUserId = user.id === conversation.user_id ? conversation.vendor_id : conversation.user_id

          // Track typing status
          const typingKey = `${conversationId}-${user.id}`
          if (isTyping) {
            typingUsers.set(typingKey, true)
          } else {
            typingUsers.delete(typingKey)
          }

          // Emit to recipient if they're connected
          if (connectedUsers.has(targetUserId)) {
            connectedUsers.get(targetUserId).emit("typing", {
              conversationId,
              userId: user.id,
              isTyping,
            })
          }
        } catch (error) {
          console.error("Error handling typing status:", error)
        }
      })

      socket.on("read_receipt", async (data) => {
        try {
          const { conversationId, messageId } = data

          // Get conversation details
          const conversations = await sql`
            SELECT user_id, vendor_id FROM conversations WHERE id = ${conversationId}
          `

          if (conversations.length === 0) {
            return
          }

          const conversation = conversations[0]
          const targetUserId = user.id === conversation.user_id ? conversation.vendor_id : conversation.user_id

          // Update message status to read
          await sql`
            UPDATE messages 
            SET status = 'read', read_at = NOW() 
            WHERE id = ${messageId}
          `

          // Emit to sender if they're connected
          if (connectedUsers.has(targetUserId)) {
            connectedUsers.get(targetUserId).emit("read_receipt", {
              conversationId,
              messageId,
              readBy: user.id,
              timestamp: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error("Error handling read receipt:", error)
        }
      })

      socket.on("disconnect", () => {
        console.log(`User ${user.id} disconnected`)
        connectedUsers.delete(user.id)

        // Clean up typing status
        for (const [key, _] of typingUsers.entries()) {
          if (key.endsWith(`-${user.id}`)) {
            typingUsers.delete(key)
          }
        }
      })
    })

    // Create a response object with the WebSocket headers
    const response = new NextResponse(null, {
      status: 101,
      headers: {
        Upgrade: "websocket",
        Connection: "Upgrade",
        "Sec-WebSocket-Accept": "accepted",
      },
    })

    return response
  } catch (error) {
    console.error("WebSocket error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
