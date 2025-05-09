import { NextResponse } from "next/server"
import { getCurrentUser, getVendorForUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function GET() {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a vendor
    const vendor = await getVendorForUser(user.id)

    let unreadCount = 0

    if (vendor) {
      // Get unread count for vendor
      const result = await sql`
        SELECT COUNT(*) as count
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE c.vendor_id = ${vendor.id}
        AND m.sender_id != ${user.id}
        AND m.read = false
      `
      unreadCount = Number.parseInt(result[0].count)
    } else {
      // Get unread count for regular user
      const result = await sql`
        SELECT COUNT(*) as count
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE c.user_id = ${user.id}
        AND m.sender_id != ${user.id}
        AND m.read = false
      `
      unreadCount = Number.parseInt(result[0].count)
    }

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error("Error fetching unread count:", error)
    return NextResponse.json({ error: "Failed to fetch unread count" }, { status: 500 })
  }
}
