import { NextResponse } from "next/server"
import { sql } from "@/lib/db-direct"
import { Stack } from "@stackframe/stack"

// Initialize Stack
const stack = new Stack({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "",
  serverKey: process.env.STACK_SECRET_SERVER_KEY || "",
})

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const users = await sql`SELECT id, email FROM users WHERE email = ${email}`

    if (users.length === 0) {
      // Don't reveal if user exists or not for security reasons
      return NextResponse.json({ success: true })
    }

    // Send password reset email using Stack
    await stack.auth.sendPasswordResetEmail({
      email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/new-password`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 })
  }
}
