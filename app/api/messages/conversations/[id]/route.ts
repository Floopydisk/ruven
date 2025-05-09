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

    // Get conversation details
    const conversations = await sql`
      SELECT c.id, c.vendor_id, v.business_name, v.logo_image
      FROM conversations c
      JOIN vendors v ON c.vendor_id = v.id
      WHERE c.id = ${conversationId} AND c.user_id = ${user.id}
    `

    if (conversations.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const conversation = conversations[0]

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        vendorId: conversation.vendor_id,
      },
      vendor: {
        id: conversation.vendor_id,
        businessName: conversation.business_name,
        logoImage: conversation.logo_image || "/placeholder.svg?height=100&width=100",
      },
    })
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 })
  }
}
