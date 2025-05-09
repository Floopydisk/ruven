import { NextResponse } from "next/server"
import { sql } from "@/lib/db-direct"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const users = await sql`SELECT id FROM users WHERE email = ${email}`

    if (users.length === 0) {
      // Create a new user record if it doesn't exist
      const newUser = await sql`
        INSERT INTO users (email, password_hash, first_name, last_name) 
        VALUES (${email}, 'stack_auth_managed', '', '') 
        RETURNING id
      `
      return NextResponse.json({ userId: newUser[0].id })
    }

    return NextResponse.json({ userId: users[0].id })
  } catch (error) {
    console.error("Error getting user ID:", error)
    return NextResponse.json({ error: "Failed to get user ID" }, { status: 500 })
  }
}
