import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { query } from "./db"
import { sql } from "@/lib/db-direct"

// Types
export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  profileImage: string | null
  role?: string
  isVendor?: boolean
}

export type Vendor = {
  id: number
  userId: number
  businessName: string
  description: string | null
  logoImage: string | null
  bannerImage: string | null
  location: string | null
  businessHours: string | null
  phone: string | null
  website: string | null
}

// Constants
const SESSION_COOKIE_NAME = "auth_session"
const SESSION_EXPIRY_DAYS = 30

// Helper functions
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Authentication functions
export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  isVendor = false,
  businessName?: string,
): Promise<User> {
  // Check if user already exists
  const existingUser = await query("SELECT * FROM users WHERE email = $1", [email])
  if (existingUser.length > 0) {
    throw new Error("User with this email already exists")
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const result = await query(
    "INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *",
    [email, passwordHash, firstName, lastName],
  )

  const user = result[0]

  // If registering as vendor, create vendor record
  if (isVendor && businessName) {
    await query("INSERT INTO vendors (user_id, business_name) VALUES ($1, $2)", [user.id, businessName])
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImage: user.profile_image,
    isVendor,
  }
}

export async function loginUser(email: string, password: string): Promise<User> {
  // Find user
  const users = await query("SELECT * FROM users WHERE email = $1", [email])
  if (users.length === 0) {
    throw new Error("Invalid email or password")
  }

  const user = users[0]

  // Verify password
  const passwordValid = await comparePasswords(password, user.password_hash)
  if (!passwordValid) {
    throw new Error("Invalid email or password")
  }

  // Create session
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  await query("INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)", [
    user.id,
    token,
    expiresAt.toISOString(),
  ])

  // Set session cookie
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  // Check if user is a vendor
  const isVendor = await checkIsVendor(user.id)

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImage: user.profile_image,
    isVendor,
  }
}

export async function logoutUser(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value
  if (token) {
    // Delete session from database
    await query("DELETE FROM sessions WHERE token = $1", [token])

    // Delete cookie
    cookies().delete(SESSION_COOKIE_NAME)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const sessionToken = cookies().get("auth_session")?.value

    if (!sessionToken) {
      return null
    }

    const sessions = await sql`
      SELECT s.*, u.id as user_id, u.email, u.first_name, u.last_name, u.profile_image, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      return null
    }

    const session = sessions[0]

    // Update last active timestamp
    await sql`
      UPDATE sessions SET last_active = NOW() WHERE token = ${sessionToken}
    `

    // Check if user is a vendor
    const isVendor = await checkIsVendor(session.user_id)

    return {
      id: session.user_id,
      email: session.email,
      firstName: session.first_name,
      lastName: session.last_name,
      profileImage: session.profile_image,
      role: session.role,
      isVendor,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

async function checkIsVendor(userId: number): Promise<boolean> {
  const vendors = await query("SELECT * FROM vendors WHERE user_id = $1", [userId])
  return vendors.length > 0
}

export async function getVendorForUser(userId: number): Promise<Vendor | null> {
  const vendors = await query("SELECT * FROM vendors WHERE user_id = $1", [userId])

  if (vendors.length === 0) {
    return null
  }

  const vendor = vendors[0]
  return {
    id: vendor.id,
    userId: vendor.user_id,
    businessName: vendor.business_name,
    description: vendor.description,
    logoImage: vendor.logo_image,
    bannerImage: vendor.banner_image,
    location: vendor.location,
    businessHours: vendor.business_hours,
    phone: vendor.phone,
    website: vendor.website,
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireVendor(): Promise<{ user: User; vendor: Vendor }> {
  const user = await requireAuth()
  const vendor = await getVendorForUser(user.id)

  if (!vendor) {
    redirect("/auth/register?type=vendor")
  }

  return { user, vendor }
}

export async function isUserVendor(userId: number) {
  try {
    const vendors = await sql`SELECT * FROM vendors WHERE user_id = ${userId}`
    return vendors.length > 0
  } catch (error) {
    console.error("Error checking if user is vendor:", error)
    return false
  }
}

export async function isUserAdmin(userId: number) {
  try {
    const users = await sql`SELECT role FROM users WHERE id = ${userId}`
    return users.length > 0 && users[0].role === "admin"
  } catch (error) {
    console.error("Error checking if user is admin:", error)
    return false
  }
}
