"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user, isLoading, isVendor } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/login")
      } else if (isVendor) {
        router.push("/dashboard/vendor")
      } else {
        router.push("/dashboard/customer")
      }
    }
  }, [user, isLoading, isVendor, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}
