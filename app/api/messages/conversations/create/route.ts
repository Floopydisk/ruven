import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recipientId, recipientType, message } = await request.json()

    if (!recipientId || !recipientType || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate recipient type
    if (!["user", "vendor"].includes(recipientType)) {
      return NextResponse.json({ error: "Invalid recipient type" }, { status: 400 })
    }

    let conversationId: number

    if (recipientType === "vendor") {
      // User to Vendor conversation
      const existingConversations = await sql`
        SELECT id FROM conversations 
        WHERE user_id = ${user.id} AND vendor_id = ${recipientId}
      `

      if (existingConversations.length > 0) {
        conversationId = existingConversations[0].id
      } else {
        const newConversation = await sql`
          INSERT INTO conversations (user_id, vendor_id, created_at, updated_at)
          VALUES (${user.id}, ${recipientId}, NOW(), NOW())
          RETURNING id
        `
        conversationId = newConversation[0].id
      }
    } else {
      // User to User conversation
      const existingConversations = await sql`
        SELECT id FROM user_conversations 
        WHERE (user1_id = ${user.id} AND user2_id = ${recipientId})
           OR (user1_id = ${recipientId} AND user2_id = ${user.id})
      `

      if (existingConversations.length > 0) {
        conversationId = existingConversations[0].id
      } else {
        const newConversation = await sql`
          INSERT INTO user_conversations (user1_id, user2_id, created_at, updated_at)
          VALUES (${user.id}, ${recipientId}, NOW(), NOW())
          RETURNING id
        `
        conversationId = newConversation[0].id
      }
    }

    // Send the initial message
    const messageResult = await sql`
      INSERT INTO messages (
        conversation_id, 
        sender_id, 
        content, 
        created_at, 
        status,
        conversation_type
      )
      VALUES (
        ${conversationId}, 
        ${user.id}, 
        ${message}, 
        NOW(), 
        'sent',
        ${recipientType === "vendor" ? "user_vendor" : "user_user"}
      )
      RETURNING id
    `

    // Update conversation timestamp
    if (recipientType === "vendor") {
      await sql`
        UPDATE conversations
        SET last_message = ${message}, updated_at = NOW()
        WHERE id = ${conversationId}
      `
    } else {
      await sql`
        UPDATE user_conversations
        SET last_message = ${message}, updated_at = NOW()
        WHERE id = ${conversationId}
      `
    }

    return NextResponse.json({
      success: true,
      conversationId,
      messageId: messageResult[0].id,
    })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
