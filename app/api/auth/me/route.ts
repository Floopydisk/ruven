import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db-direct"

export async function GET() {
  try {
    // Get session token from cookies
    const sessionToken = cookies().get("auth_session")?.value
    if (!sessionToken) {
      return NextResponse.json({ user: null, isVendor: false })
    }

    // Find valid session
    const sessions = await sql`
      SELECT * FROM sessions 
      WHERE token = ${sessionToken} 
      AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      cookies().delete("auth_session")
      return NextResponse.json({ user: null, isVendor: false })
    }

    // Update last active timestamp
    await sql`
      UPDATE sessions 
      SET last_active = NOW() 
      WHERE token = ${sessionToken}
    `

    // Get user from session
    const userId = sessions[0].user_id
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`

    if (users.length === 0) {
      cookies().delete("auth_session")
      return NextResponse.json({ user: null, isVendor: false })
    }

    const user = users[0]

    // Check if user is a vendor
    const vendors = await sql`SELECT * FROM vendors WHERE user_id = ${userId}`
    const isVendor = vendors.length > 0

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        profileImage: user.profile_image,
        role: user.role,
        emailVerified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        isVendor: isVendor,
      },
      isVendor,
    })
  } catch (error) {
    console.error("Error fetching current user:", error)
    return NextResponse.json({ user: null, isVendor: false }, { status: 500 })
  }
}
