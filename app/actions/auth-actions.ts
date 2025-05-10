"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { logoutUser } from "@/lib/auth"
import { createStackUser, loginWithStack } from "@/lib/stack-auth"
import { sql } from "@/lib/db-direct"
import { cookies } from "next/headers"
import crypto from "crypto"

// Simple session creation function
async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 1 week from now

  return token
}

export async function register(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (!email || !password || !name) {
      return { error: "All fields are required" }
    }

    // Create user with our simplified stack auth
    const stackResult = await createStackUser(email, password)

    if (!stackResult.success) {
      return { error: stackResult.error || "Failed to create user" }
    }

    // Create user in our database
    const result = await sql`
      INSERT INTO users (email, name, password_hash)
      VALUES (${email}, ${name}, 'stack_managed')
      RETURNING id, email, name
    `

    if (result.rows.length === 0) {
      return { error: "Failed to create user" }
    }

    const user = result.rows[0]

    // Set session cookie
    cookies().set("session", await createSession(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Email and password are required" }
    }

    // Login with our simplified stack auth
    const stackResult = await loginWithStack(email, password)

    if (!stackResult.success) {
      return { error: "Invalid email or password" }
    }

    // Get user from our database
    const result = await sql`
      SELECT id, email, name, role
      FROM users
      WHERE email = ${email}
    `

    if (result.rows.length === 0) {
      return { error: "Invalid email or password" }
    }

    const user = result.rows[0]

    // Set session cookie
    cookies().set("session", await createSession(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function logout() {
  await logoutUser()
  revalidatePath("/")
  redirect("/")
}
