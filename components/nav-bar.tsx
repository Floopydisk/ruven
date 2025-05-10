"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NotificationBadge } from "@/components/notification-badge"

export function NavBar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center">
          <ShoppingBag className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">UniVendor</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center gap-6">
          <Link
            href="/browse"
            className={`text-sm font-medium ${
              pathname === "/browse" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Browse
          </Link>
          {user && (
            <>
              <Link
                href="/messages"
                className={`text-sm font-medium relative ${
                  pathname?.startsWith("/messages") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Messages
                <NotificationBadge />
              </Link>
              {user.isVendor && (
                <Link
                  href="/dashboard/vendor"
                  className={`text-sm font-medium ${
                    pathname?.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Vendor Dashboard
                </Link>
              )}
              <Link
                href="/profile"
                className={`text-sm font-medium ${
                  pathname === "/profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Profile
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </>
          )}
          {!user && (
            <>
              <Link
                href="/auth/login"
                className={`text-sm font-medium ${
                  pathname === "/auth/login" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="ml-auto md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container flex flex-col py-4 px-4 space-y-4">
            <Link
              href="/browse"
              className={`text-sm font-medium ${pathname === "/browse" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            {user && (
              <>
                <Link
                  href="/messages"
                  className={`text-sm font-medium relative ${
                    pathname?.startsWith("/messages") ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                  <NotificationBadge />
                </Link>
                {user.isVendor && (
                  <Link
                    href="/dashboard/vendor"
                    className={`text-sm font-medium ${
                      pathname?.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Vendor Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className={`text-sm font-medium ${
                    pathname === "/profile" ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start p-0 h-auto font-medium text-sm text-muted-foreground"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                >
                  Logout
                </Button>
              </>
            )}
            {!user && (
              <>
                <Link
                  href="/auth/login"
                  className={`text-sm font-medium ${
                    pathname === "/auth/login" ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
