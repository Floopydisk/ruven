"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { registerUser, loginUser, logoutUser } from "@/lib/auth"

export async function register(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const accountType = formData.get("accountType") as string
    const businessName = formData.get("businessName") as string | undefined

    const isVendor = accountType === "vendor"

    await registerUser(email, password, firstName, lastName, isVendor, businessName)

    // Redirect based on account type
    if (isVendor) {
      redirect("/dashboard/vendor")
    } else {
      redirect("/dashboard")
    }
  } catch (error: any) {
    return { error: error.message || "Registration failed" }
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const user = await loginUser(email, password)

    // Check if user is a vendor
    const response = await fetch(`/api/users/${user.id}/vendor`)
    const data = await response.json()

    if (data.vendor) {
      redirect("/dashboard/vendor")
    } else {
      redirect("/dashboard")
    }
  } catch (error: any) {
    return { error: error.message || "Login failed" }
  }
}

export async function logout() {
  await logoutUser()
  revalidatePath("/")
  redirect("/")
}
