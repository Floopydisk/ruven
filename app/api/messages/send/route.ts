import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      conversationId,
      content,
      conversationType = "user_vendor",
      recipientId,
      hasAttachment = false,
      attachmentUrl = null,
      attachmentType = null,
      attachmentName = null,
    } = await request.json()

    if (!content && !hasAttachment) {
      return NextResponse.json({ error: "Message content or attachment is required" }, { status: 400 })
    }

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    // Verify user has access to this conversation
    let hasAccess = false
    let actualRecipientId = recipientId

    if (conversationType === "user_vendor") {
      const conversations = await sql`
        SELECT user_id, vendor_id FROM conversations WHERE id = ${conversationId}
      `
      if (conversations.length > 0) {
        const conv = conversations[0]
        hasAccess = conv.user_id === user.id || conv.vendor_id === user.id
        actualRecipientId = conv.user_id === user.id ? conv.vendor_id : conv.user_id
      }
    } else if (conversationType === "user_user") {
      const conversations = await sql`
        SELECT user1_id, user2_id FROM user_conversations WHERE id = ${conversationId}
      `
      if (conversations.length > 0) {
        const conv = conversations[0]
        hasAccess = conv.user1_id === user.id || conv.user2_id === user.id
        actualRecipientId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check privacy settings
    const privacySettings = await sql`
      SELECT * FROM user_privacy_settings WHERE user_id = ${actualRecipientId}
    `

    if (privacySettings.length > 0) {
      const settings = privacySettings[0]
      if (!settings.allow_messages_from_strangers && conversationType === "user_user") {
        // Check if users are connected (have previous conversations)
        const previousMessages = await sql`
          SELECT COUNT(*) as count FROM messages 
          WHERE conversation_id = ${conversationId}
        `
        if (previousMessages[0].count === 0) {
          return NextResponse.json({ error: "User does not accept messages from strangers" }, { status: 403 })
        }
      }
    }

    // Send message with encryption flag
    const message = await sql`
      INSERT INTO messages (
        conversation_id, 
        sender_id, 
        recipient_id,
        content, 
        created_at, 
        status, 
        conversation_type,
        has_attachment, 
        attachment_url, 
        attachment_type, 
        attachment_name,
        is_encrypted
      )
      VALUES (
        ${conversationId}, 
        ${user.id}, 
        ${actualRecipientId},
        ${content}, 
        NOW(), 
        'sent', 
        ${conversationType},
        ${hasAttachment}, 
        ${attachmentUrl}, 
        ${attachmentType}, 
        ${attachmentName},
        true
      )
      RETURNING id, sender_id, content, created_at as timestamp, status, has_attachment, attachment_url, attachment_type, attachment_name
    `

    // Update conversation's last_message and updated_at
    if (conversationType === "user_vendor") {
      await sql`
        UPDATE conversations
        SET last_message = ${content || "Sent an attachment"}, updated_at = NOW()
        WHERE id = ${conversationId}
      `
    } else {
      await sql`
        UPDATE user_conversations
        SET last_message = ${content || "Sent an attachment"}, updated_at = NOW()
        WHERE id = ${conversationId}
      `
    }

    return NextResponse.json({
      success: true,
      conversationId,
      recipientId: actualRecipientId,
      message: message[0],
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
