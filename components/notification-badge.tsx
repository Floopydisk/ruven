"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return

    // Fetch initial unread count
    fetchUnreadCount()

    // Set up polling for new notifications
    const interval = setInterval(fetchUnreadCount, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/messages/unread-count")
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  if (!isAuthenticated || unreadCount === 0) {
    return null
  }

  return (
    <Badge className="bg-primary text-primary-foreground absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
      {unreadCount > 9 ? "9+" : unreadCount}
    </Badge>
  )
}
