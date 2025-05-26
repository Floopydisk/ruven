"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  profileImage?: string | null
  role?: string
  emailVerified?: boolean
  twoFactorEnabled?: boolean
  isVendor?: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isVendor: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; requiresTwoFactor?: boolean; userId?: number }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUserProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

type RegisterData = {
  email: string
  password: string
  firstName: string
  lastName: string
  isVendor?: boolean
  businessName?: string
}

type UpdateProfileData = {
  firstName?: string
  lastName?: string
  name?: string
  phone?: string
  profileImage?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isVendor, setIsVendor] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/auth/me/", {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          setIsVendor(data.isVendor || data.user.isVendor || false)
          setIsAuthenticated(true)
          return true
        } else {
          setUser(null)
          setIsVendor(false)
          setIsAuthenticated(false)
          return false
        }
      } else {
        setUser(null)
        setIsVendor(false)
        setIsAuthenticated(false)
        return false
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setUser(null)
      setIsVendor(false)
      setIsAuthenticated(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      })

      if (!res.ok) {
        const error = await res.json()
        return { success: false, error: error.error || "Login failed" }
      }

      const data = await res.json()

      // If 2FA is required, return early
      if (data.requiresTwoFactor) {
        return {
          success: true,
          requiresTwoFactor: true,
          userId: data.userId,
        }
      }

      // Set user data from response
      setUser(data.user)
      setIsVendor(data.isVendor || data.user.isVendor || false)
      setIsAuthenticated(true)

      // Check if there's a redirect URL in the query params
      const redirect = searchParams?.get("redirect")
      if (redirect) {
        router.push(redirect)
      } else {
        router.push("/home")
      }

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      })

      if (!res.ok) {
        const error = await res.json()
        return { success: false, error: error.error || "Registration failed" }
      }

      const responseData = await res.json()
      setUser(responseData.user)
      setIsVendor(responseData.isVendor || responseData.user.isVendor || false)
      setIsAuthenticated(true)

      // Check if there's a redirect URL in the query params
      const redirect = searchParams?.get("redirect")
      if (redirect) {
        router.push(redirect)
      } else {
        router.push("/home")
      }

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      setUser(null)
      setIsVendor(false)
      setIsAuthenticated(false)

      // Force a router refresh to update the UI
      router.refresh()

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserProfile = async (data: UpdateProfileData) => {
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      })

      if (!res.ok) {
        const error = await res.json()
        return { success: false, error: error.error || "Failed to update profile" }
      }

      // Refresh user data
      await refreshUser()

      return { success: true }
    } catch (error) {
      console.error("Failed to update profile:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    try {
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        cache: "no-store",
      })

      if (!res.ok) {
        const error = await res.json()
        return { success: false, error: error.error || "Failed to update password" }
      }

      return { success: true }
    } catch (error) {
      console.error("Failed to update password:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isVendor,
        login,
        register,
        logout,
        updateUserProfile,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
