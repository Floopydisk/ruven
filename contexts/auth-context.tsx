"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

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
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          setIsVendor(data.isVendor || data.user.isVendor || false)
          setIsAuthenticated(true)
          return true
        }
      }

      // Clear state if not authenticated
      setUser(null)
      setIsVendor(false)
      setIsAuthenticated(false)
      return false
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setUser(null)
      setIsVendor(false)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      await refreshUser()
      setInitialized(true)
      setIsLoading(false)
    }

    if (!initialized) {
      initializeAuth()
    }
  }, [refreshUser, initialized])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" }
      }

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
        credentials: "include",
        body: JSON.stringify(data),
        cache: "no-store",
      })

      const responseData = await res.json()

      if (!res.ok) {
        return { success: false, error: responseData.error || "Registration failed" }
      }

      setUser(responseData.user)
      setIsVendor(responseData.isVendor || responseData.user.isVendor || false)
      setIsAuthenticated(true)

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
      await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      setUser(null)
      setIsVendor(false)
      setIsAuthenticated(false)

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
        credentials: "include",
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
        credentials: "include",
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
