"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { initializeNotifications, onNewMessage } from "@/lib/notification-service"

type Notification = {
  id: number
  conversationId: number
  vendorName: string
  message: string
  timestamp: string
}

export function MessageNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [hasUnread, setHasUnread] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Fetch initial notifications
    fetchNotifications()

    // Set up real-time notifications
    const { channel } = initializeNotifications(user.id)

    const handleNewMessage = (data: any) => {
      // Add new notification
      fetchNotifications()
    }

    const unbind = onNewMessage(handleNewMessage)

    // Set up polling for new notifications as a fallback
    const interval = setInterval(fetchNotifications, 30000) // Check every 30 seconds

    return () => {
      clearInterval(interval)
      unbind()
    }
  }, [isAuthenticated, user])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/messages/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setHasUnread(data.notifications.length > 0)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleNotificationClick = (conversationId: number) => {
    router.push(`/messages/${conversationId}`)

    // Remove this notification from the list
    setNotifications((prev) => prev.filter((n) => n.conversationId !== conversationId))
    if (notifications.length <= 1) {
      setHasUnread(false)
    }
  }

  if (!isAuthenticated || notifications.length === 0) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 font-medium border-b">Messages</div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="p-3 cursor-pointer"
              onClick={() => handleNotificationClick(notification.conversationId)}
            >
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{notification.vendorName}</span>
                  <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                </div>
                <p className="text-sm truncate">{notification.message}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuItem
          className="p-2 border-t text-center text-primary cursor-pointer"
          onClick={() => router.push("/messages")}
        >
          View All Messages
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
