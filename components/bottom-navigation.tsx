"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NotificationBadge } from "@/components/notification-badge"

export function BottomNavigation() {
  const pathname = usePathname()
  const { user, isVendor } = useAuth()

  // Don't show on login/register pages
  if (!user || pathname?.startsWith("/auth/") || pathname === "/auth" || pathname === "/landing" || pathname === "/")
    return null

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background shadow-lg z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/home"
          className="flex flex-col items-center justify-center py-2 px-4 w-1/5 h-full transition-colors"
        >
          <Home
            className={`h-6 w-6 ${pathname === "/home" || pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
          />
          <span
            className={`text-xs mt-1 ${
              pathname === "/home" || pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </span>
        </Link>

        <Link
          href="/browse"
          className="flex flex-col items-center justify-center py-2 px-4 w-1/5 h-full transition-colors"
        >
          <Search className={`h-6 w-6 ${pathname === "/browse" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs mt-1 ${pathname === "/browse" ? "text-primary" : "text-muted-foreground"}`}>
            Browse
          </span>
        </Link>

        <Link
          href={isVendor ? "/dashboard/vendor/products/new" : "/sell"}
          className="flex flex-col items-center justify-center py-2 px-4 w-1/5 h-full transition-colors"
        >
          <div className="bg-primary rounded-full p-2 -mt-8 shadow-lg">
            <PlusCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xs mt-1 text-muted-foreground">Add</span>
        </Link>

        <Link
          href="/messages"
          className="flex flex-col items-center justify-center py-2 px-4 w-1/5 h-full transition-colors relative"
        >
          <MessageSquare
            className={`h-6 w-6 ${pathname?.startsWith("/messages") ? "text-primary" : "text-muted-foreground"}`}
          />
          <NotificationBadge className="absolute top-1 right-3" />
          <span
            className={`text-xs mt-1 ${pathname?.startsWith("/messages") ? "text-primary" : "text-muted-foreground"}`}
          >
            Messages
          </span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center justify-center py-2 px-4 w-1/5 h-full transition-colors"
        >
          <User
            className={`h-6 w-6 ${
              pathname === "/profile" || pathname?.startsWith("/profile/") ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-xs mt-1 ${
              pathname === "/profile" || pathname?.startsWith("/profile/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Profile
          </span>
        </Link>
      </div>
    </div>
  )
}
