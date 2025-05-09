import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"

export async function POST() {
  try {
    const sessionToken = cookies().get("auth_session")?.value

    if (sessionToken) {
      // Delete session from database using tagged template syntax
      await sql`DELETE FROM sessions WHERE token = ${sessionToken}`

      // Delete cookie
      cookies().delete("auth_session")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
