import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import Pusher from "pusher"

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
  useTLS: true,
})

export async function POST(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const socketId = formData.get("socket_id") as string
    const channel = formData.get("channel_name") as string

    // Only authorize if the channel belongs to the current user
    if (channel === `private-user-${user.id}`) {
      const authResponse = pusher.authorizeChannel(socketId, channel)
      return NextResponse.json(authResponse)
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } catch (error) {
    console.error("Pusher auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
