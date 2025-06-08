"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import {
  MessageSquare,
  ShoppingBag,
  User,
  Bell,
  BarChart3,
  Activity,
  Calendar,
  TrendingUp,
  Star,
  Zap,
  Coffee,
  Laptop,
  BookOpen,
} from "lucide-react"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user, isLoading } = useAuth()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const stats = [
    {
      title: "Messages",
      value: "12",
      subtitle: "3 unread",
      icon: MessageSquare,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      progress: 75,
    },
    {
      title: "Vendors Followed",
      value: "8",
      subtitle: "2 new updates",
      icon: ShoppingBag,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      progress: 40,
    },
    {
      title: "Notifications",
      value: "5",
      subtitle: "View all",
      icon: Bell,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      progress: 25,
    },
  ]

  const activities = [
    {
      type: "promotion",
      title: "New vendor promotion",
      description: "Campus Coffee is offering 20% off this week",
      time: "2 hours ago",
      icon: Activity,
      color: "text-orange-400",
    },
    {
      type: "message",
      title: "Message from Campus Books",
      description: "Your order has been shipped",
      time: "Yesterday",
      icon: MessageSquare,
      color: "text-blue-400",
    },
    {
      type: "event",
      title: "Vendor Event",
      description: "Food Truck Festival this weekend",
      time: "3 days ago",
      icon: Calendar,
      color: "text-purple-400",
    },
  ]

  const popularVendors = [
    {
      name: "Campus Coffee",
      category: "Coffee & Snacks",
      icon: Coffee,
      rating: 4.9,
      gradient: "from-orange-500 to-red-600",
    },
    {
      name: "Campus Books",
      category: "Books & Supplies",
      icon: BookOpen,
      rating: 4.8,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      name: "Tech Hub",
      category: "Electronics & Repairs",
      icon: Laptop,
      rating: 4.7,
      gradient: "from-green-500 to-teal-600",
    },
  ]

  const recentMessages = [
    {
      vendor: "Campus Coffee",
      message: "Thanks for your order! Your coffee will be ready in 5 minutes.",
      time: "10:23 AM",
      unread: true,
    },
    {
      vendor: "Campus Books",
      message: "Your order has been shipped and will arrive in 2-3 business days.",
      time: "Yesterday",
      unread: false,
    },
    {
      vendor: "Tech Hub",
      message: "Your laptop repair is complete. You can pick it up anytime.",
      time: "3 days ago",
      unread: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <NavBar />

      <div className="flex flex-1">
        {/* Modern Sidebar */}
        <div className="hidden md:flex w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700">
          <div className="flex flex-col w-full">
            <div className="p-6 border-b border-slate-700">
              <h2 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                UniVendor
              </h2>
              <p className="text-xs text-slate-400 mt-1">Student Dashboard</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-3 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/messages"
                className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                <span>Messages</span>
              </Link>
              <Link
                href="/browse"
                className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <ShoppingBag className="h-5 w-5 mr-3" />
                <span>Browse Vendors</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <User className="h-5 w-5 mr-3" />
                <span>Profile</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-700">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400">System Status</span>
                  <span className="text-xs text-green-400 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ width: "92%" }}
                  ></div>
                </div>
                <span className="text-xs text-slate-400 mt-1">92% Performance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-slate-400 mt-1">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ""} to your student dashboard
              </p>
            </div>

            <div className="mt-4 md:mt-0 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-mono text-blue-400">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-xs text-slate-400">
                  {currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:scale-105 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-blue-400 mt-1">{stat.subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${stat.progress}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Recent Activity
              </TabsTrigger>
              <TabsTrigger value="vendors" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Popular Vendors
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Recent Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-400" />
                    Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-slate-600/50">
                        <activity.icon className={`h-5 w-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{activity.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">{activity.description}</p>
                        <p className="text-slate-500 text-xs mt-2">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vendors">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                    Popular Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {popularVendors.map((vendor, index) => (
                    <Link key={index} href={`/vendors/${index + 1}`}>
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${vendor.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                          >
                            <vendor.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{vendor.name}</h4>
                            <p className="text-slate-400 text-sm">{vendor.category}</p>
                            <div className="flex items-center mt-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-slate-300 ml-1">{vendor.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          View
                        </Button>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-green-400" />
                    Recent Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentMessages.map((message, index) => (
                    <Link key={index} href={`/messages/${index + 1}`}>
                      <div className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-white flex items-center">
                              {message.vendor}
                              {message.unread && <div className="w-2 h-2 bg-blue-400 rounded-full ml-2"></div>}
                            </h4>
                            <span className="text-xs text-slate-500">{message.time}</span>
                          </div>
                          <p className="text-slate-400 text-sm mt-1 line-clamp-2">{message.message}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { href: "/browse", icon: ShoppingBag, label: "Browse Vendors", color: "from-blue-500 to-purple-600" },
                { href: "/messages", icon: MessageSquare, label: "Messages", color: "from-purple-500 to-pink-600" },
                { href: "/profile", icon: User, label: "Profile", color: "from-green-500 to-teal-600" },
                { href: "/notifications", icon: Bell, label: "Notifications", color: "from-orange-500 to-red-600" },
              ].map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer group h-24">
                    <CardContent className="flex flex-col items-center justify-center h-full p-4">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                      >
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white text-center">{action.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
