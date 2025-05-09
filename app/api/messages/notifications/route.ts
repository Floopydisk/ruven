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

    // Get unread messages
    const notifications = await sql`
      SELECT m.id, m.conversation_id, m.content, m.created_at,
             v.business_name as vendor_name
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      JOIN vendors v ON c.vendor_id = v.id
      WHERE c.user_id = ${user.id}
      AND m.sender_id != ${user.id}
      AND m.read = false
      ORDER BY m.created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        id: n.id,
        conversationId: n.conversation_id,
        vendorName: n.vendor_name,
        message: n.content,
        timestamp: formatTimestamp(n.created_at),
      })),
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
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

  // Otherwise return date
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}
