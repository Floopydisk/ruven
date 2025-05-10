import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"
import { generateVerificationCode, sendVerificationEmail } from "@/lib/stack-auth"

export async function POST() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate a verification code
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Code expires in 1 hour

    // Store the verification code
    await sql`
      UPDATE users 
      SET 
        email_verification_code = ${verificationCode},
        email_verification_expires = ${expiresAt.toISOString()}
      WHERE id = ${user.id}
    `

    // Send the verification email
    await sendVerificationEmail(user.email, verificationCode)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
  }
}
