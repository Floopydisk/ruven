import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"
import Pusher from "pusher"

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
  useTLS: true,
})

export async function POST(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { event, data } = await request.json()

    if (event === "message") {
      const { conversationId, messageId, message, hasAttachment, attachmentUrl, attachmentType, attachmentName } = data

      // Get conversation details
      const conversations = await sql`
        SELECT user_id, vendor_id FROM conversations WHERE id = ${conversationId}
      `

      if (conversations.length === 0) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      const conversation = conversations[0]
      const targetUserId = user.id === conversation.user_id ? conversation.vendor_id : conversation.user_id

      // Trigger Pusher event
      await pusher.trigger(`private-user-${targetUserId}`, "message", {
        conversationId,
        senderId: user.id,
        message,
        messageId,
        timestamp: new Date().toISOString(),
        status: "delivered",
        hasAttachment,
        attachmentUrl,
        attachmentType,
        attachmentName,
      })

      // Update message status to delivered
      await sql`
        UPDATE messages 
        SET status = 'delivered', delivered_at = NOW() 
        WHERE id = ${messageId}
      `
    } else if (event === "typing") {
      const { conversationId, isTyping } = data

      // Get conversation details
      const conversations = await sql`
        SELECT user_id, vendor_id FROM conversations WHERE id = ${conversationId}
      `

      if (conversations.length === 0) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      const conversation = conversations[0]
      const targetUserId = user.id === conversation.user_id ? conversation.vendor_id : conversation.user_id

      // Trigger Pusher event
      await pusher.trigger(`private-user-${targetUserId}`, "typing", {
        conversationId,
        userId: user.id,
        isTyping,
      })
    } else if (event === "read_receipt") {
      const { conversationId, messageId } = data

      // Get conversation details
      const conversations = await sql`
        SELECT user_id, vendor_id FROM conversations WHERE id = ${conversationId}
      `

      if (conversations.length === 0) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      const conversation = conversations[0]
      const targetUserId = user.id === conversation.user_id ? conversation.vendor_id : conversation.user_id

      // Update message status to read
      await sql`
        UPDATE messages 
        SET status = 'read', read = true, read_at = NOW() 
        WHERE id = ${messageId}
      `

      // Trigger Pusher event
      await pusher.trigger(`private-user-${targetUserId}`, "read_receipt", {
        conversationId,
        messageId,
        readBy: user.id,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Socket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
