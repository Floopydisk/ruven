import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function POST(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      vendorId,
      conversationId,
      content,
      hasAttachment = false,
      attachmentUrl = null,
      attachmentType = null,
      attachmentName = null,
    } = await request.json()

    if (!content && !hasAttachment) {
      return NextResponse.json({ error: "Message content or attachment is required" }, { status: 400 })
    }

    let messageConversationId = conversationId

    // If no conversationId is provided, create a new conversation
    if (!conversationId) {
      if (!vendorId) {
        return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 })
      }

      // Check if conversation already exists
      const existingConversations = await sql`
        SELECT id FROM conversations 
        WHERE user_id = ${user.id} AND vendor_id = ${vendorId}
      `

      if (existingConversations.length > 0) {
        messageConversationId = existingConversations[0].id
      } else {
        // Create new conversation
        const newConversation = await sql`
          INSERT INTO conversations (user_id, vendor_id, created_at, updated_at)
          VALUES (${user.id}, ${vendorId}, NOW(), NOW())
          RETURNING id
        `
        messageConversationId = newConversation[0].id
      }
    }

    // Send message
    const message = await sql`
      INSERT INTO messages (
        conversation_id, 
        sender_id, 
        content, 
        created_at, 
        status, 
        has_attachment, 
        attachment_url, 
        attachment_type, 
        attachment_name
      )
      VALUES (
        ${messageConversationId}, 
        ${user.id}, 
        ${content}, 
        NOW(), 
        'sent', 
        ${hasAttachment}, 
        ${attachmentUrl}, 
        ${attachmentType}, 
        ${attachmentName}
      )
      RETURNING id, sender_id, content, created_at as timestamp, status, has_attachment, attachment_url, attachment_type, attachment_name
    `

    // Update conversation's last_message and updated_at
    await sql`
      UPDATE conversations
      SET last_message = ${content || "Sent an attachment"}, updated_at = NOW()
      WHERE id = ${messageConversationId}
    `

    // Get recipient ID for socket communication
    const conversations = await sql`
      SELECT user_id, vendor_id FROM conversations WHERE id = ${messageConversationId}
    `

    const conversation = conversations[0]
    const recipientId = user.id === conversation.user_id ? conversation.vendor_id : conversation.user_id

    return NextResponse.json({
      success: true,
      conversationId: messageConversationId,
      recipientId,
      message: message[0],
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
