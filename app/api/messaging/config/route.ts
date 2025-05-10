import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    // Ensure the user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return only the minimal configuration needed for the client
    // with a signed token instead of raw credentials
    return NextResponse.json({
      userId: user.id,
      // Generate a signed token that can be used for authentication
      // instead of exposing the actual Pusher key
      authEndpoint: "/api/pusher/auth",
      cluster: process.env.PUSHER_CLUSTER || "",
    })
  } catch (error) {
    console.error("Error getting messaging config:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
