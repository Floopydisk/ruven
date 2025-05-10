"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthState } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  updateUserProfile: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isVendor: false,
  })

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()

        // Check if user is a vendor
        let isVendor = false
        if (userData.user) {
          const vendorResponse = await fetch(`/api/vendors/check?userId=${userData.user.id}`)
          if (vendorResponse.ok) {
            const vendorData = await vendorResponse.json()
            isVendor = vendorData.isVendor

            // Add isVendor property to user object
            userData.user.isVendor = isVendor
          }
        }

        setState({
          user: userData.user,
          isLoading: false,
          isVendor,
        })
      } else {
        setState({
          user: null,
          isLoading: false,
          isVendor: false,
        })
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setState({
        user: null,
        isLoading: false,
        isVendor: false,
      })
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await refreshUser()
        return { success: true, message: "Login successful" }
      } else {
        return { success: false, message: data.error || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      // Validate password is a string
      if (typeof userData.password !== "string") {
        return { success: false, message: "Invalid password format" }
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        await refreshUser()
        return { success: true, message: "Registration successful" }
      } else {
        return { success: false, message: data.error || "Registration failed" }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "An error occurred during registration" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setState({
        user: null,
        isLoading: false,
        isVendor: false,
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      if (!state.user) {
        return { success: false, message: "Not authenticated" }
      }

      const response = await fetch(`/api/users/${state.user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        await refreshUser()
        return { success: true, message: "Profile updated successfully" }
      } else {
        return { success: false, message: data.error || "Failed to update profile" }
      }
    } catch (error) {
      console.error("Update profile error:", error)
      return { success: false, message: "An error occurred while updating profile" }
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUserProfile, refreshUser }}>
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
