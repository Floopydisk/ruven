"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export function AdminNavbar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/admin" className="flex items-center">
          <ShieldAlert className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-xl">Admin Panel</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center gap-6">
          <Link
            href="/admin"
            className={`text-sm font-medium ${
              isActive("/admin") &&
              !isActive("/admin/users") &&
              !isActive("/admin/analytics") &&
              !isActive("/admin/security")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className={`text-sm font-medium ${
              isActive("/admin/users") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Users
          </Link>
          <Link
            href="/admin/analytics"
            className={`text-sm font-medium ${
              isActive("/admin/analytics") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Analytics
          </Link>
          <Link
            href="/admin/security"
            className={`text-sm font-medium ${
              isActive("/admin/security") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Security
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Back to App
          </Link>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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
              href="/admin"
              className={`text-sm font-medium ${
                isActive("/admin") &&
                !isActive("/admin/users") &&
                !isActive("/admin/analytics") &&
                !isActive("/admin/security")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className={`text-sm font-medium ${isActive("/admin/users") ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Users
            </Link>
            <Link
              href="/admin/analytics"
              className={`text-sm font-medium ${isActive("/admin/analytics") ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Analytics
            </Link>
            <Link
              href="/admin/security"
              className={`text-sm font-medium ${isActive("/admin/security") ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Security
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Back to App
            </Link>
            <Button
              variant="ghost"
              className="justify-start p-0 h-auto font-medium text-sm text-muted-foreground"
              onClick={() => {
                logout()
                setMobileMenuOpen(false)
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      )}
    </div>
  )
}
