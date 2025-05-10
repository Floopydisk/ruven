"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, MessageSquare, Store, BarChart3, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

type VendorStats = {
  totalProducts: number
  totalMessages: number
  unreadMessages: number
  profileViews: number
}

export function VendorDashboardContent() {
  const { user } = useAuth()
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 0,
    totalMessages: 0,
    unreadMessages: 0,
    profileViews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [vendorId, setVendorId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchVendorData() {
      if (!user) return

      try {
        // First get vendor ID
        const vendorResponse = await fetch(`/api/vendors/check?userId=${user.id}`)
        if (!vendorResponse.ok) {
          throw new Error("Failed to verify vendor status")
        }

        const vendorData = await vendorResponse.json()
        if (!vendorData.isVendor || !vendorData.vendor) {
          setIsLoading(false)
          return
        }

        setVendorId(vendorData.vendor.id)

        // Simulate fetching stats
        // In a real app, you would fetch this from an API
        setTimeout(() => {
          setStats({
            totalProducts: 12,
            totalMessages: 24,
            unreadMessages: 3,
            profileViews: 156,
          })
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching vendor data:", error)
        setIsLoading(false)
      }
    }

    fetchVendorData()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalProducts}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalMessages}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                <h3 className="text-2xl font-bold mt-1">{stats.unreadMessages}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                <h3 className="text-2xl font-bold mt-1">{stats.profileViews}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Store className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Manage Products</CardTitle>
              <CardDescription>Add, edit, or remove products and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-1">Add New Products</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create listings for your products or services with details and pricing
                  </p>
                  <Link href="/dashboard/vendor/products">
                    <Button variant="outline" className="w-full">
                      Add Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-1">Manage Inventory</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update stock levels, prices, and product information
                  </p>
                  <Link href="/dashboard/vendor/products">
                    <Button variant="outline" className="w-full">
                      View Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/vendor/products" className="w-full">
                <Button className="w-full">Go to Product Management</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Customer Messages</CardTitle>
              <CardDescription>View and respond to customer inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Unread Messages</h3>
                      <p className="text-sm text-muted-foreground">
                        You have {stats.unreadMessages} unread messages from customers
                      </p>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Response Time</h3>
                      <p className="text-sm text-muted-foreground">Your average response time is 2 hours</p>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-full">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/vendor/messages" className="w-full">
                <Button className="w-full">Go to Messages</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Update your business information and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-1">Profile Information</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your business details, logo, and contact information
                  </p>
                  <Link href="/dashboard/vendor/profile">
                    <Button variant="outline" className="w-full">
                      Edit Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-1">Business Hours</h3>
                  <p className="text-sm text-muted-foreground mb-4">Set your operating hours and availability</p>
                  <Link href="/dashboard/vendor/profile">
                    <Button variant="outline" className="w-full">
                      Update Hours
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/vendor/profile" className="w-full">
                <Button className="w-full">Manage Profile</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
