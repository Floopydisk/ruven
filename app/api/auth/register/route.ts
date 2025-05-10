import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sql } from "@/lib/db-direct"
import { logSecurityEvent } from "@/lib/security-logger"

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, isVendor, businessName } = await request.json()

    // Check if user already exists
    const existingUsers = await sql`SELECT * FROM users WHERE email = ${email}`
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userResult = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, created_at)
      VALUES (${email}, ${hashedPassword}, ${firstName}, ${lastName}, NOW())
      RETURNING id
    `

    const userId = userResult[0].id

    // Create vendor profile if requested
    let vendorId = null
    if (isVendor && businessName) {
      const vendorResult = await sql`
        INSERT INTO vendors (user_id, business_name, created_at)
        VALUES (${userId}, ${businessName}, NOW())
        RETURNING id
      `
      vendorId = vendorResult[0].id
    }

    // Create session
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await sql`
      INSERT INTO sessions (user_id, token, expires_at, user_agent, ip_address, last_active)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()}, ${request.headers.get("user-agent") || "unknown"}, ${
        request.headers.get("x-forwarded-for") || "unknown"
      }, NOW())
    `

    // Set session cookie
    cookies().set({
      name: "auth_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    // Log registration
    await logSecurityEvent({
      userId,
      eventType: "user_registered",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      details: { email },
    })

    return NextResponse.json({
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        profileImage: null,
        role: "user",
        emailVerified: false,
        twoFactorEnabled: false,
      },
      isVendor: !!vendorId,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
