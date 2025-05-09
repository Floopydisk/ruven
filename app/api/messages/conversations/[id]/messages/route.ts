import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversationId = Number.parseInt(params.id)

    // Verify user has access to this conversation
    const conversations = await sql`
      SELECT id, user_id, vendor_id FROM conversations
      WHERE id = ${conversationId} AND (user_id = ${user.id} OR vendor_id = ${user.id})
    `

    if (conversations.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Get messages
    const messages = await sql`
      SELECT 
        id, 
        sender_id, 
        content, 
        created_at as timestamp, 
        status, 
        has_attachment, 
        attachment_url, 
        attachment_type, 
        attachment_name
      FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `

    // Mark unread messages as read
    await sql`
      UPDATE messages
      SET read = true, status = 'read', read_at = NOW()
      WHERE conversation_id = ${conversationId}
      AND sender_id != ${user.id}
      AND read = false
    `

    return NextResponse.json({
      messages: messages.map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id,
        content: msg.content,
        timestamp: msg.timestamp,
        isFromCurrentUser: msg.sender_id === user.id,
        status: msg.status,
        hasAttachment: msg.has_attachment,
        attachmentUrl: msg.attachment_url,
        attachmentType: msg.attachment_type,
        attachmentName: msg.attachment_name,
      })),
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
