"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, ArrowRight, Store, Package, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NavBar } from "@/components/nav-bar"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function SellPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isVendor, setIsVendor] = useState(false)
  const [isCheckingVendor, setIsCheckingVendor] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkVendorStatus() {
      if (!isAuthenticated || !user) {
        setIsCheckingVendor(false)
        return
      }

      try {
        const response = await fetch(`/api/vendors/check?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setIsVendor(data.isVendor)
        }
      } catch (error) {
        console.error("Error checking vendor status:", error)
      } finally {
        setIsCheckingVendor(false)
      }
    }

    checkVendorStatus()
  }, [isAuthenticated, user])

  if (isLoading || isCheckingVendor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1 container px-4 py-8 flex flex-col items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Sign in to continue</CardTitle>
              <CardDescription>You need to be signed in to access vendor features</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-2">
              <Link href="/auth/login" className="w-full">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/register" className="w-full">
                <Button variant="outline" className="w-full">
                  Create an Account
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  if (isVendor) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1 container px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Vendor Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard/vendor/products">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Package className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Manage Products</CardTitle>
                  <CardDescription>Add, edit, or remove products and services</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between">
                    Go to Products
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>

            <Link href="/dashboard/vendor/profile">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Store className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Business Profile</CardTitle>
                  <CardDescription>Update your business information and settings</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between">
                    Edit Profile
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>

            <Link href="/dashboard/vendor/messages">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <MessageSquare className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>View and respond to customer inquiries</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between">
                    View Messages
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          </div>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 container px-4 py-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl">Become a Vendor</CardTitle>
            <CardDescription className="text-center">
              Register your business and start selling products and services to university students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-1 rounded-full">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Create your business profile</h3>
                <p className="text-sm text-muted-foreground">
                  Set up your business details, location, and operating hours
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-1 rounded-full">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">List your products and services</h3>
                <p className="text-sm text-muted-foreground">
                  Add your offerings with descriptions, images, and pricing
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-1 rounded-full">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Connect with customers</h3>
                <p className="text-sm text-muted-foreground">
                  Receive and respond to inquiries through our messaging system
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/auth/register?type=vendor" className="w-full">
              <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                Register as Vendor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
      <BottomNavigation />
    </div>
  )
}
