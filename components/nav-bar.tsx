"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X, User, Store, LogOut, Settings, MessageSquare, ShoppingBag } from "lucide-react"

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVendor, setIsVendor] = useState(false)
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

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

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const getDashboardLink = () => {
    if (isVendor) {
      return "/dashboard/vendor"
    }
    return "/dashboard/customer"
  }

  const getProfileLink = () => {
    if (isVendor) {
      return "/profile/vendor"
    }
    return "/profile"
  }

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UV</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              UniVendor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/browse"
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                pathname === "/browse" ? "text-blue-400" : "text-slate-300"
              }`}
            >
              Browse
            </Link>
            {user && (
              <>
                <Link
                  href="/messages"
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                    pathname.startsWith("/messages") ? "text-blue-400" : "text-slate-300"
                  }`}
                >
                  Messages
                </Link>
                <Link
                  href={getDashboardLink()}
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                    pathname.startsWith("/dashboard") ? "text-blue-400" : "text-slate-300"
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage || undefined} alt={user.firstName} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      {isVendor && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full w-fit">
                          Vendor
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>
                      {isVendor ? <Store className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  {isVendor && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/vendor/products">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Products
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={getProfileLink()}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden text-slate-300" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col space-y-2">
              <Link
                href="/browse"
                className="text-slate-300 hover:text-blue-400 px-3 py-2 text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                Browse
              </Link>
              {user && (
                <>
                  <Link
                    href="/messages"
                    className="text-slate-300 hover:text-blue-400 px-3 py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    href={getDashboardLink()}
                    className="text-slate-300 hover:text-blue-400 px-3 py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={getProfileLink()}
                    className="text-slate-300 hover:text-blue-400 px-3 py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
