"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NotificationBadge } from "@/components/notification-badge"

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // Don't show on login/register pages
  if (pathname?.startsWith("/auth/") || pathname === "/auth" || pathname === "/landing" || pathname === "/") {
    return null
  }

  const handleNavigation = (path: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${path}`)
    } else {
      router.push(path)
    }
  }

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

        <button
          onClick={() => handleNavigation("/browse")}
          className="flex flex-col items-center justify-center py-2 px-4 w-1/5 h-full transition-colors border-none bg-transparent"
        >
          <Search className={`h-6 w-6 ${pathname === "/browse" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs mt-1 ${pathname === "/browse" ? "text-primary" : "text-muted-foreground"}`}>
            Browse
          </span>
        </button>

        <button
          onClick={() =>
            handleNavigation(isAuthenticated && user?.isVendor ? "/dashboard/vendor/products/new" : "/sell")
          }
          className="flex flex-col items-center justify-center py-2 px-4 w-1/5 h-full transition-colors border-none bg-transparent"
        >
          <div className="bg-primary rounded-full p-2 -mt-8 shadow-lg">
            <PlusCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xs mt-1 text-muted-foreground">Add</span>
        </button>

        <button
          onClick={() => handleNavigation("/messages")}
          className="flex flex-col items-center justify-center py-2 px-4 w-1/5 h-full transition-colors relative border-none bg-transparent"
        >
          <MessageSquare
            className={`h-6 w-6 ${pathname?.startsWith("/messages") ? "text-primary" : "text-muted-foreground"}`}
          />
          {isAuthenticated && <NotificationBadge className="absolute top-1 right-3" />}
          <span
            className={`text-xs mt-1 ${pathname?.startsWith("/messages") ? "text-primary" : "text-muted-foreground"}`}
          >
            Messages
          </span>
        </button>

        <button
          onClick={() => handleNavigation("/profile")}
          className="flex flex-col items-center justify-center py-2 px-4 w-1/5 h-full transition-colors border-none bg-transparent"
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
        </button>
      </div>
    </div>
  )
}
