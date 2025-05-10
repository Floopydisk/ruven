"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, Search, MessageSquare, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NotificationBadge } from "./notification-badge"

export function BottomNavigation() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread message count
  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const res = await fetch("/api/messages/unread-count")
          if (res.ok) {
            const data = await res.json()
            setUnreadCount(data.count)
          }
        } catch (error) {
          console.error("Error fetching unread count:", error)
        }
      }

      fetchUnreadCount()

      // Set up interval to check periodically
      const interval = setInterval(fetchUnreadCount, 30000) // every 30 seconds

      return () => clearInterval(interval)
    }
  }, [user])

  // Don't show on landing page
  if (pathname === "/landing") {
    return null
  }

  // Handle navigation for protected routes
  const handleNavigation = (path: string) => {
    if (!user && !loading) {
      // Save the intended destination
      router.push(`/auth/login?callbackUrl=${path}`)
    } else {
      router.push(path)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => handleNavigation("/home")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname === "/home" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          onClick={() => handleNavigation("/browse")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname === "/browse" || pathname.startsWith("/vendors") ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <Search size={24} />
          <span className="text-xs mt-1">Browse</span>
        </button>

        <button
          onClick={() => handleNavigation("/messages")}
          className={`flex flex-col items-center justify-center w-full h-full relative ${
            pathname === "/messages" || pathname.startsWith("/messages/") ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <MessageSquare size={24} />
          {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
          <span className="text-xs mt-1">Messages</span>
        </button>

        <button
          onClick={() => handleNavigation("/profile")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname === "/profile" || pathname.startsWith("/profile/") ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  )
}
