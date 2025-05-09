"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, MessageSquare, Settings, BarChart3, Users, Package, Star } from "lucide-react"
import type { User, Vendor } from "@/lib/auth"

interface VendorDashboardContentProps {
  user: User
  vendor: Vendor
}

export function VendorDashboardContent({ user, vendor }: VendorDashboardContentProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-muted/40">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 mr-2" />
            <span className="font-bold text-xl">UniVendor</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <Link
              href="/dashboard/vendor"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                activeTab === "overview" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/dashboard/vendor/products"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                activeTab === "products" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
              onClick={() => setActiveTab("products")}
            >
              <Package className="h-4 w-4" />
              Products & Services
            </Link>
            <Link
              href="/dashboard/vendor/messages"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                activeTab === "messages" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
              onClick={() => setActiveTab("messages")}
            >
              <MessageSquare className="h-4 w-4" />
              Messages
            </Link>
            <Link
              href="/dashboard/vendor/profile"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                activeTab === "profile" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <Settings className="h-4 w-4" />
              Profile Settings
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image
                src={user.profileImage || "/placeholder.svg?height=40&width=40"}
                alt="Vendor logo"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-medium">{vendor.businessName}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-16 items-center border-b px-6 md:hidden">
          <div className="mr-2">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold">Vendor Dashboard</h1>
        </header>

        <main className="p-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="md:hidden">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
              <h1 className="text-2xl font-bold hidden md:block">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "products" && "Products & Services"}
                {activeTab === "messages" && "Messages"}
                {activeTab === "profile" && "Profile Settings"}
              </h1>
              <div className="flex gap-2">
                <Link href="/dashboard/vendor/products">
                  <Button variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    Manage Products
                  </Button>
                </Link>
                <Link href="/dashboard/vendor/profile">
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 added this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < 5 ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
