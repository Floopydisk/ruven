import { NextResponse } from "next/server"

export async function GET() {
  // Only return the public Pusher configuration
  return NextResponse.json({
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  })
}
