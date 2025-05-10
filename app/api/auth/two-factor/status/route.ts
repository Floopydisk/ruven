import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if 2FA is enabled for the user
    const result = await sql`
      SELECT two_factor_enabled FROM users WHERE id = ${user.id}
    `

    const enabled = result[0]?.two_factor_enabled || false

    return NextResponse.json({ enabled })
  } catch (error) {
    console.error("Error checking 2FA status:", error)
    return NextResponse.json({ error: "Failed to check 2FA status" }, { status: 500 })
  }
}
