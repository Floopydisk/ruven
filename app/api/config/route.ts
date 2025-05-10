import { NextResponse } from "next/server"

// This function returns only the public configuration that is safe to expose
export async function GET() {
  // Only return configuration that is safe for the client
  const publicConfig = {
    // Add any safe configuration here
    features: {
      messaging: true,
      notifications: true,
      realtime: true,
    },
    // Do not include any sensitive keys or tokens
  }

  return NextResponse.json(publicConfig)
}
