"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { logoutUser } from "@/lib/auth"
import { createStackUser, loginWithStack } from "@/lib/stack-auth"
import { sql } from "@vercel/postgres"
import { cookies } from "next/headers"
import { createSession } from "@/lib/session"

export async function register(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    // Create user in Stack
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

    if (result.length === 0) {
      return { error: "Failed to create user" }
    }

    const user = result[0]

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

    // Login with Stack
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

    if (result.length === 0) {
      return { error: "Invalid email or password" }
    }

    const user = result[0]

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
