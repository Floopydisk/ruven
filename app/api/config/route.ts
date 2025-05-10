import { NextResponse } from "next/server"

// This function returns only the public environment variables that are safe to expose
export async function GET() {
  // Only return environment variables that are explicitly marked as public
  const publicConfig = {
    // Add any NEXT_PUBLIC_ variables here that are needed by the client
    pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
    pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
  }

  return NextResponse.json(publicConfig)
}
