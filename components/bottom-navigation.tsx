"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, Search, MessageSquare, User, Plus, Store, ShoppingBag } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NotificationBadge } from "./notification-badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function BottomNavigation() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isVendor, setIsVendor] = useState(false)

  // Check if user is a vendor
  useEffect(() => {
    if (user) {
      const checkVendorStatus = async () => {
        try {
          const res = await fetch("/api/vendors/check")
          if (res.ok) {
            const data = await res.json()
            setIsVendor(data.isVendor)
          }
        } catch (error) {
          console.error("Error checking vendor status:", error)
        }
      }
      checkVendorStatus()
    }
  }, [user])

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
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Don't show on landing page or auth pages
  if (pathname === "/landing" || pathname.startsWith("/auth/")) {
    return null
  }

  const handleNavigation = (path: string) => {
    if (!user && !loading) {
      router.push(`/auth/login?callbackUrl=${path}`)
    } else {
      router.push(path)
    }
  }

  const NavButton = ({
    icon: Icon,
    label,
    path,
    isActive,
    badge,
  }: {
    icon: any
    label: string
    path: string
    isActive: boolean
    badge?: number
  }) => (
    <button
      onClick={() => handleNavigation(path)}
      className={`flex flex-col items-center justify-center relative transition-all duration-300 ${
        isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary hover:scale-105"
      }`}
    >
      <div className="relative">
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        {badge && badge > 0 && <NotificationBadge count={badge} />}
      </div>
      <span
        className={`text-xs mt-1 font-medium transition-all duration-300 ${isActive ? "opacity-100" : "opacity-70"}`}
      >
        {label}
      </span>
      {isActive && <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse" />}
    </button>
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />

      {/* Navigation content */}
      <div className="relative flex items-center justify-around h-20 px-4">
        <NavButton icon={Home} label="Home" path="/home" isActive={pathname === "/home"} />

        <NavButton
          icon={Search}
          label="Browse"
          path="/browse"
          isActive={pathname === "/browse" || pathname.startsWith("/vendors")}
        />

        {/* Center Plus Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="relative h-14 w-14 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            >
              <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48 mb-4">
            <DropdownMenuItem onClick={() => handleNavigation("/messages/new")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              New Message
            </DropdownMenuItem>
            {isVendor ? (
              <>
                <DropdownMenuItem onClick={() => handleNavigation("/dashboard/vendor/products")}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add Product
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("/dashboard/vendor")}>
                  <Store className="mr-2 h-4 w-4" />
                  Vendor Dashboard
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => handleNavigation("/sell")}>
                <Store className="mr-2 h-4 w-4" />
                Become a Vendor
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <NavButton
          icon={MessageSquare}
          label="Messages"
          path="/messages"
          isActive={pathname === "/messages" || pathname.startsWith("/messages/")}
          badge={unreadCount}
        />

        <NavButton
          icon={User}
          label="Profile"
          path="/profile"
          isActive={pathname === "/profile" || pathname.startsWith("/profile/")}
        />
      </div>
    </div>
  )
}
