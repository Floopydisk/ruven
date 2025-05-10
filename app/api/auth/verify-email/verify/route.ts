import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's verification code
    const result = await sql`
      SELECT 
        email_verification_code, 
        email_verification_expires 
      FROM users 
      WHERE id = ${user.id}
    `

    const storedCode = result[0]?.email_verification_code
    const expiresAt = result[0]?.email_verification_expires

    if (!storedCode) {
      return NextResponse.json({ error: "No verification code found" }, { status: 400 })
    }

    // Check if code is expired
    if (new Date(expiresAt) < new Date()) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 400 })
    }

    // Verify the code
    if (storedCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Mark email as verified
    await sql`
      UPDATE users 
      SET 
        email_verified = true,
        email_verification_code = NULL,
        email_verification_expires = NULL
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
