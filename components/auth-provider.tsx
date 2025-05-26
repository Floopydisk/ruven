"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  profileImage: string | null
}

type Vendor = {
  id: number
  userId: number
  businessName: string
}

type AuthContextType = {
  user: User | null
  vendor: Vendor | null
  isLoading: boolean
  isVendor: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  vendor: null,
  isLoading: true,
  isVendor: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()

        if (data.user) {
          setUser(data.user)

          // Check if user is a vendor
          if (data.user.id) {
            const vendorRes = await fetch(`/api/users/${data.user.id}/vendor`)
            const vendorData = await vendorRes.json()
            setVendor(vendorData.vendor)
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  return <AuthContext.Provider value={{ user, vendor, isLoading, isVendor: !!vendor }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
