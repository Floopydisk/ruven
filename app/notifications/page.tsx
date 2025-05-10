"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, MessageSquare, ShoppingBag, Clock, Shield, Info } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { BottomNavigation } from "@/components/bottom-navigation"
import { NavBar } from "@/components/nav-bar"

type Notification = {
  id: number
  type: "message" | "security" | "system" | "vendor"
  title: string
  description: string
  timestamp: string
  read: boolean
  link?: string
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching notifications
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: "message",
          title: "New message from Campus Coffee",
          description: "Your order is ready for pickup!",
          timestamp: "10 minutes ago",
          read: false,
          link: "/messages/1",
        },
        {
          id: 2,
          type: "security",
          title: "New login to your account",
          description: "A new login was detected from New York, USA",
          timestamp: "2 hours ago",
          read: false,
          link: "/profile/security",
        },
        {
          id: 3,
          type: "vendor",
          title: "New vendor promotion",
          description: "Campus Books is offering 20% off this week",
          timestamp: "Yesterday",
          read: true,
          link: "/vendors/2",
        },
        {
          id: 4,
          type: "system",
          title: "Welcome to UniVendor",
          description: "Thanks for joining our platform!",
          timestamp: "3 days ago",
          read: true,
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "security":
        return <Shield className="h-5 w-5 text-red-500" />
      case "vendor":
        return <ShoppingBag className="h-5 w-5 text-green-500" />
      case "system":
        return <Info className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-primary" />
    }
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <NavBar />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Link key={notification.id} href={notification.link || "#"} onClick={() => markAsRead(notification.id)}>
                <Card
                  className={`hover:border-primary/30 transition-colors ${
                    !notification.read ? "border-primary/50 bg-primary/5" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-secondary">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {notification.timestamp}
                          </span>
                        </div>
                        <p
                          className={`text-sm mt-1 ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {notification.description}
                        </p>
                      </div>
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-muted-foreground mb-6">You don't have any notifications at the moment</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  )
}
