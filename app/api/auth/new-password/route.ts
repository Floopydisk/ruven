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
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    // Verify token and reset password using Stack
    const result = await stack.auth.resetPassword({
      token,
      password,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to reset password" }, { status: 400 })
    }

    // Update password in our database
    if (result.userId) {
      // Get user email from Stack
      const userInfo = await stack.auth.getUserInfo(result.userId)

      if (userInfo && userInfo.email) {
        // Update user in our database
        await sql`
          UPDATE users 
          SET password_hash = ${result.passwordHash || "stack_managed"} 
          WHERE email = ${userInfo.email}
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("New password error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
