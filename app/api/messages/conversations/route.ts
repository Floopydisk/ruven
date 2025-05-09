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

    // Get all conversations for the user
    const conversations = await sql`
      SELECT c.id, c.vendor_id, c.last_message, c.updated_at,
             v.business_name as vendor_name, v.logo_image as vendor_image,
             (SELECT COUNT(*) FROM messages m 
              WHERE m.conversation_id = c.id 
              AND m.sender_id != ${user.id} 
              AND m.read = false) as unread_count
      FROM conversations c
      JOIN vendors v ON c.vendor_id = v.id
      WHERE c.user_id = ${user.id}
      ORDER BY c.updated_at DESC
    `

    return NextResponse.json({
      conversations: conversations.map((conv: any) => ({
        id: conv.id,
        vendorId: conv.vendor_id,
        vendorName: conv.vendor_name,
        vendorImage: conv.vendor_image || "/placeholder.svg?height=100&width=100",
        lastMessage: conv.last_message,
        timestamp: formatTimestamp(conv.updated_at),
        unread: conv.unread_count > 0,
      })),
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
