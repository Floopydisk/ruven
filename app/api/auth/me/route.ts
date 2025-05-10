import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"

export async function GET() {
  try {
    // Get session token from cookies
    const sessionToken = cookies().get("auth_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null, isVendor: false }, { status: 200 })
    }

    // Get session from database
    const sessions = await sql`
      SELECT s.*, u.id, u.email, u.first_name, u.last_name, u.profile_image, u.role, u.email_verified, u.two_factor_enabled
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      // Clear invalid session cookie
      cookies().delete("auth_session")
      return NextResponse.json({ user: null, isVendor: false }, { status: 200 })
    }

    const session = sessions[0]

    // Update last active timestamp
    await sql`UPDATE sessions SET last_active = NOW() WHERE token = ${sessionToken}`

    // Check if user is a vendor
    const vendors = await sql`SELECT * FROM vendors WHERE user_id = ${session.id}`
    const isVendor = vendors.length > 0

    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email,
        firstName: session.first_name,
        lastName: session.last_name,
        profileImage: session.profile_image,
        role: session.role,
        emailVerified: session.email_verified,
        twoFactorEnabled: session.two_factor_enabled,
        isVendor: isVendor,
      },
      isVendor,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
