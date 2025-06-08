import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function GET() {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all conversations for the user (both as customer and vendor)
    const customerConversations = await sql`
      SELECT c.id, c.vendor_id, c.last_message, c.updated_at,
             v.business_name as vendor_name, v.logo_image as vendor_image,
             'customer' as conversation_type,
             (SELECT COUNT(*) FROM messages m 
              WHERE m.conversation_id = c.id 
              AND m.sender_id != ${user.id} 
              AND m.is_read = false) as unread_count
      FROM conversations c
      JOIN vendors v ON c.vendor_id = v.id
      WHERE c.user_id = ${user.id}
    `

    // Check if user is a vendor and get vendor conversations
    const vendorConversations = await sql`
      SELECT c.id, c.user_id, c.last_message, c.updated_at,
             u.first_name, u.last_name, u.profile_image,
             'vendor' as conversation_type,
             (SELECT COUNT(*) FROM messages m 
              WHERE m.conversation_id = c.id 
              AND m.sender_id != ${user.id} 
              AND m.is_read = false) as unread_count
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      JOIN vendors v ON c.vendor_id = v.id
      WHERE v.user_id = ${user.id}
    `

    // Combine and format conversations
    const allConversations = [
      ...customerConversations.map((conv: any) => ({
        id: conv.id,
        type: "customer",
        otherPartyId: conv.vendor_id,
        otherPartyName: conv.vendor_name,
        otherPartyImage: conv.vendor_image || "/placeholder.svg?height=100&width=100",
        lastMessage: conv.last_message,
        timestamp: formatTimestamp(conv.updated_at),
        unread: conv.unread_count > 0,
      })),
      ...vendorConversations.map((conv: any) => ({
        id: conv.id,
        type: "vendor",
        otherPartyId: conv.user_id,
        otherPartyName: `${conv.first_name} ${conv.last_name}`,
        otherPartyImage: conv.profile_image || "/placeholder.svg?height=100&width=100",
        lastMessage: conv.last_message,
        timestamp: formatTimestamp(conv.updated_at),
        unread: conv.unread_count > 0,
      })),
    ]

    // Sort by timestamp
    allConversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      conversations: allConversations,
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

// Helper function to format timestamp
function formatTimestamp(timestamp: Date): string {
  const now = new Date()
  const date = new Date(timestamp)

  // If today, return time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // If yesterday
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  // If within the last week
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(now.getDate() - 7)
  if (date > oneWeekAgo) {
    return date.toLocaleDateString([], { weekday: "long" })
  }

  // Otherwise return date
  return date.toLocaleDateString()
}
