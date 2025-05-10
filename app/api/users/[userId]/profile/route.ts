import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"
import { securityLogger } from "@/lib/security-logger"

export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)
    const user = await getCurrentUser()

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { name, email, avatar } = data

    // Update user profile
    await sql`
      UPDATE users 
      SET 
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        avatar = COALESCE(${avatar}, avatar),
        updated_at = NOW()
      WHERE id = ${userId}
    `

    // Log the profile update
    await securityLogger.log({
      userId: user.id,
      eventType: "PROFILE_UPDATE",
      details: { fields: Object.keys(data) },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    // Return updated user data
    return NextResponse.json({
      name: name || user.name,
      email: email || user.email,
      avatar: avatar || user.avatar,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
