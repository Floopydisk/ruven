"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Menu, X } from "lucide-react"

export function ModernNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center">
          <ShoppingBag className="h-6 w-6 mr-2 text-blue-500" />
          <span className="font-bold text-xl">UniVendor</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center gap-6">
          <Link href="/browse" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Browse
          </Link>
          <Link href="/sell" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sell
          </Link>
          <Link href="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Log in
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-blue-600 hover:bg-blue-700">Sign up</Button>
          </Link>
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
        <div className="md:hidden border-t border-slate-800">
          <nav className="container flex flex-col py-4 px-4 space-y-4">
            <Link
              href="/browse"
              className="text-sm font-medium text-slate-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link href="/sell" className="text-sm font-medium text-slate-300" onClick={() => setMobileMenuOpen(false)}>
              Sell
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-300" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <div className="pt-2 flex flex-col space-y-2">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign up</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
