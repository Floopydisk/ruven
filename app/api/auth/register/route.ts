import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db-direct"

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, isVendor, businessName } = await request.json()

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure password is a string
    if (typeof password !== "string") {
      return NextResponse.json({ error: "Password must be a string" }, { status: 400 })
    }

    // Check if user already exists using tagged template syntax
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password with explicit salt rounds
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user using tagged template syntax
    const result = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name) 
      VALUES (${email}, ${passwordHash}, ${firstName}, ${lastName}) 
      RETURNING *
    `

    const user = result[0]

    // If registering as vendor, create vendor record
    if (isVendor && businessName) {
      await sql`INSERT INTO vendors (user_id, business_name) VALUES (${user.id}, ${businessName})`
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      isVendor,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
