import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    // Ensure the user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if Pusher is configured
    const isPusherConfigured = Boolean(process.env.PUSHER_KEY && process.env.PUSHER_CLUSTER)

    // Return minimal configuration needed for the client
    return NextResponse.json({
      // Only return the cluster and auth endpoint, not the key
      cluster: process.env.PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
      // Include a user-specific channel name
      channel: `presence-user-${user.id}`,
      // Don't include the actual Pusher key
    })
  } catch (error) {
    console.error("Error getting Pusher config:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
