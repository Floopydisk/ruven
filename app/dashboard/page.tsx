"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, ShoppingBag, User, Bell, BarChart3, Activity, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const hours = currentDate.getHours().toString().padStart(2, "0")
  const minutes = currentDate.getMinutes().toString().padStart(2, "0")
  const seconds = currentDate.getSeconds().toString().padStart(2, "0")
  const timeString = `${hours}:${minutes}:${seconds}`

  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="hidden md:flex dashboard-sidebar flex-col">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-semibold text-lg">UniVendor</h2>
            <p className="text-xs text-muted-foreground">Student Dashboard</p>
          </div>
          <div className="flex-1 py-4 px-2">
            <nav className="space-y-1">
              <Link href="/dashboard" className="dashboard-sidebar-item active">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/messages" className="dashboard-sidebar-item">
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </Link>
              <Link href="/browse" className="dashboard-sidebar-item">
                <ShoppingBag className="h-4 w-4" />
                <span>Browse Vendors</span>
              </Link>
              <Link href="/profile" className="dashboard-sidebar-item">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </nav>
          </div>
          <div className="p-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>System Status</span>
                <span className="text-green-500">Online</span>
              </div>
              <div className="mt-2 flex items-center">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: "92%" }}></div>
                </div>
                <span className="ml-2 text-xs">92%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Overview</h1>
              <p className="text-muted-foreground">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ""} to your student dashboard
              </p>
            </div>
            <div className="mt-4 md:mt-0 p-3 bg-secondary/50 rounded-lg border border-border/50">
              <div className="text-center">
                <div className="text-2xl font-mono text-primary">{timeString}</div>
                <div className="text-xs text-muted-foreground">{formattedDate}</div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="stat-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="stat-label">Messages</p>
                  <p className="stat-value">12</p>
                  <p className="text-xs text-primary mt-1">3 unread</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="progress-bar">
                  <div className="progress-bar-value" style={{ width: "75%" }}></div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="stat-label">Vendors Followed</p>
                  <p className="stat-value">8</p>
                  <p className="text-xs text-primary mt-1">2 new updates</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="progress-bar">
                  <div className="progress-bar-value" style={{ width: "40%" }}></div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="stat-label">Notifications</p>
                  <p className="stat-value">5</p>
                  <p className="text-xs text-primary mt-1">View all</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="progress-bar">
                  <div className="progress-bar-value" style={{ width: "25%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs section */}
          <Tabs defaultValue="activity" className="mt-6">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="vendors">Popular Vendors</TabsTrigger>
              <TabsTrigger value="messages">Recent Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Activity items */}
                    <div className="flex items-start gap-4 pb-4 border-b border-border/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">New vendor promotion</p>
                        <p className="text-sm text-muted-foreground">Campus Coffee is offering 20% off this week</p>
                        <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-4 border-b border-border/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Message from Campus Books</p>
                        <p className="text-sm text-muted-foreground">Your order has been shipped</p>
                        <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Vendor Event</p>
                        <p className="text-sm text-muted-foreground">Food Truck Festival this weekend</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vendors">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Popular Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link
                      href="/vendors/1"
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Campus Coffee</p>
                          <p className="text-xs text-muted-foreground">Coffee & Snacks</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>

                    <Link
                      href="/vendors/2"
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Campus Books</p>
                          <p className="text-xs text-muted-foreground">Books & Supplies</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>

                    <Link
                      href="/vendors/3"
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Tech Hub</p>
                          <p className="text-xs text-muted-foreground">Electronics & Repairs</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link href="/messages/1" className="flex items-start gap-4 pb-4 border-b border-border/50">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">Campus Coffee</p>
                          <p className="text-xs text-muted-foreground">10:23 AM</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Thanks for your order! Your coffee will be ready in 5 minutes.
                        </p>
                      </div>
                    </Link>

                    <Link href="/messages/2" className="flex items-start gap-4 pb-4 border-b border-border/50">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">Campus Books</p>
                          <p className="text-xs text-muted-foreground">Yesterday</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Your order has been shipped and will arrive in 2-3 business days.
                        </p>
                      </div>
                    </Link>

                    <Link href="/messages/3" className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">Tech Hub</p>
                          <p className="text-xs text-muted-foreground">3 days ago</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Your laptop repair is complete. You can pick it up anytime.
                        </p>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick actions */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/browse">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                  <span>Browse Vendors</span>
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <span>Messages</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  <span>Profile</span>
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Bell className="h-6 w-6 text-primary" />
                  <span>Notifications</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
