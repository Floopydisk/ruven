"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusCircle, User, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function BottomNavigation() {
  const pathname = usePathname()
  const { user, isVendor } = useAuth()

  if (!user) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 md:hidden pb-safe">
      <div className="flex justify-around">
        <Link href="/home" className="flex flex-col items-center py-3 px-2">
          <Home className={`h-6 w-6 ${pathname === "/home" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs mt-1 ${pathname === "/home" ? "text-primary" : "text-muted-foreground"}`}>
            Home
          </span>
        </Link>

        <Link href="/browse" className="flex flex-col items-center py-3 px-2">
          <Search className={`h-6 w-6 ${pathname === "/browse" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs mt-1 ${pathname === "/browse" ? "text-primary" : "text-muted-foreground"}`}>
            Browse
          </span>
        </Link>

        <Link href="/sell" className="flex flex-col items-center py-3 px-2">
          <PlusCircle className={`h-6 w-6 ${pathname === "/sell" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs mt-1 ${pathname === "/sell" ? "text-primary" : "text-muted-foreground"}`}>Add</span>
        </Link>

        <Link href={isVendor ? "/dashboard/vendor" : "/dashboard"} className="flex flex-col items-center py-3 px-2">
          <LayoutDashboard
            className={`h-6 w-6 ${pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"}`}
          />
          <span
            className={`text-xs mt-1 ${pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"}`}
          >
            Dashboard
          </span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center py-3 px-2">
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
