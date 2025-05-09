import { NextResponse } from "next/server"
import { getCurrentUser, getVendorForUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function GET() {
  try {
    // Get current user and vendor
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vendor = await getVendorForUser(user.id)
    if (!vendor) {
      return NextResponse.json({ error: "Not a vendor" }, { status: 403 })
    }

    // Get all conversations for the vendor
    const conversations = await sql`
      SELECT c.id, c.user_id, c.last_message, c.updated_at,
             u.first_name, u.last_name, u.profile_image,
             (SELECT COUNT(*) FROM messages m 
              WHERE m.conversation_id = c.id 
              AND m.sender_id != ${user.id} 
              AND m.read = false) as unread_count
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      WHERE c.vendor_id = ${vendor.id}
      ORDER BY c.updated_at DESC
    `

    return NextResponse.json({
      conversations: conversations.map((conv: any) => ({
        id: conv.id,
        userId: conv.user_id,
        userName: `${conv.first_name} ${conv.last_name}`,
        userImage: conv.profile_image,
        lastMessage: conv.last_message,
        timestamp: formatTimestamp(conv.updated_at),
        unread: conv.unread_count > 0,
      })),
    })
  } catch (error) {
    console.error("Error fetching vendor conversations:", error)
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
