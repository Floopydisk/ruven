import { NextResponse } from "next/server"
import { sql } from "@/lib/db-direct"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const vendors = await sql`SELECT * FROM vendors WHERE user_id = ${userId}`
    const isVendor = vendors.length > 0

    return NextResponse.json({ isVendor })
  } catch (error) {
    console.error("Error checking vendor status:", error)
    return NextResponse.json({ error: "Failed to check vendor status" }, { status: 500 })
  }
}
