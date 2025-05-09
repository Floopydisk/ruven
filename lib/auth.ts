import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { query } from "./db"

// Types
export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  profileImage: string | null
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

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImage: user.profile_image,
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
  const token = cookies().get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  // Find valid session
  const sessions = await query("SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()", [token])

  if (sessions.length === 0) {
    cookies().delete(SESSION_COOKIE_NAME)
    return null
  }

  // Get user from session
  const userId = sessions[0].user_id
  const users = await query("SELECT * FROM users WHERE id = $1", [userId])

  if (users.length === 0) {
    cookies().delete(SESSION_COOKIE_NAME)
    return null
  }

  const user = users[0]
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImage: user.profile_image,
  }
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
