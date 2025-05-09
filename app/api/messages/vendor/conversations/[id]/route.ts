import { NextResponse } from "next/server"
import { getCurrentUser, getVendorForUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const conversationId = Number.parseInt(params.id)

    // Get conversation details
    const conversations = await sql`
      SELECT c.id, c.user_id, u.first_name, u.last_name, u.profile_image, u.email
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${conversationId} AND c.vendor_id = ${vendor.id}
    `

    if (conversations.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const conversation = conversations[0]

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        userId: conversation.user_id,
      },
      user: {
        id: conversation.user_id,
        firstName: conversation.first_name,
        lastName: conversation.last_name,
        profileImage: conversation.profile_image,
        email: conversation.email,
      },
    })
  } catch (error) {
    console.error("Error fetching vendor conversation:", error)
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 })
  }
}
