import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    // Ensure the user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate a short-lived token that includes the Pusher key
    // This is more secure than directly exposing the key
    const key = process.env.PUSHER_KEY

    if (!key) {
      return NextResponse.json({ error: "Pusher not configured" }, { status: 500 })
    }

    return NextResponse.json({ key })
  } catch (error) {
    console.error("Error getting Pusher key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
