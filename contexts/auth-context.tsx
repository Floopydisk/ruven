"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  profileImage: string | null
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isVendor: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isVendor: boolean }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    isVendor: boolean,
    businessName?: string,
  ) => Promise<{ success: boolean; error?: string; isVendor: boolean }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVendor, setIsVendor] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()

        if (data.user) {
          setUser(data.user)

          // Check if user is a vendor
          const vendorRes = await fetch(`/api/vendors/check?userId=${data.user.id}`)
          const vendorData = await vendorRes.json()
          setIsVendor(vendorData.isVendor)
        }
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed", isVendor: false }
      }

      setUser(data.user)
      setIsVendor(data.isVendor)

      // Force a router refresh to update the navigation state
      router.refresh()

      return { success: true, isVendor: data.isVendor }
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed", isVendor: false }
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    isVendorValue: boolean,
    businessName?: string,
  ) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          isVendor: isVendorValue,
          businessName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed", isVendor: false }
      }

      // Login after registration
      return await login(email, password)
    } catch (error: any) {
      return { success: false, error: error.message || "Registration failed", isVendor: false }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
      setIsVendor(false)
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isVendor,
        login,
        register,
        logout,
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
