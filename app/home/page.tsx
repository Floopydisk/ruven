"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/nav-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  ShoppingBag,
  MessageSquare,
  Star,
  TrendingUp,
  Coffee,
  Laptop,
  BookOpen,
  Bell,
  Heart,
  Zap,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/home")
    }
  }, [mounted, isLoading, isAuthenticated, router])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  const greeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const quickActions = [
    {
      title: "Browse Vendors",
      description: "Discover amazing local businesses",
      icon: ShoppingBag,
      href: "/browse",
      gradient: "from-blue-500 to-purple-600",
      stats: "500+ vendors",
    },
    {
      title: "Messages",
      description: "Chat with vendors directly",
      icon: MessageSquare,
      href: "/messages",
      gradient: "from-purple-500 to-pink-600",
      stats: "3 unread",
    },
    {
      title: "Favorites",
      description: "Your saved vendors",
      icon: Heart,
      href: "/favorites",
      gradient: "from-pink-500 to-red-600",
      stats: "12 saved",
    },
    {
      title: "Profile",
      description: "Manage your account",
      icon: Users,
      href: "/profile",
      gradient: "from-green-500 to-teal-600",
      stats: "Complete",
    },
  ]

  const trendingVendors = [
    {
      name: "Campus Coffee Co.",
      category: "Food & Beverage",
      rating: 4.9,
      image: "/placeholder.svg?height=60&width=60",
      trending: true,
      discount: "20% off",
    },
    {
      name: "Tech Repair Hub",
      category: "Electronics",
      rating: 4.8,
      image: "/placeholder.svg?height=60&width=60",
      trending: true,
      discount: "Free diagnosis",
    },
    {
      name: "Campus Books",
      category: "Academic",
      rating: 4.7,
      image: "/placeholder.svg?height=60&width=60",
      trending: false,
      discount: "Buy 2 get 1",
    },
  ]

  const recentActivity = [
    {
      type: "message",
      title: "New message from Campus Coffee",
      description: "Your order is ready for pickup!",
      time: "5 min ago",
      icon: MessageSquare,
      color: "text-blue-400",
    },
    {
      type: "promotion",
      title: "Special offer available",
      description: "Tech Repair Hub: 20% off laptop repairs",
      time: "1 hour ago",
      icon: Zap,
      color: "text-yellow-400",
    },
    {
      type: "review",
      title: "Review reminder",
      description: "Rate your experience with Campus Books",
      time: "2 hours ago",
      icon: Star,
      color: "text-purple-400",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pb-20">
      <NavBar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-8 pb-12">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm mb-4">
              <Sparkles className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Welcome back!</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {greeting()},
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {user?.firstName || "Student"}!
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-8">Ready to explore what's happening on campus today?</p>

            {/* Time Display */}
            <div className="inline-flex items-center px-6 py-3 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm">
              <div className="text-2xl font-mono text-blue-400">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="ml-4 text-slate-400">
                {currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                    <p className="text-slate-400 text-sm mb-3">{action.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{action.stats}</span>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Trending Vendors */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                      Trending Vendors
                    </CardTitle>
                    <Link href="/browse">
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trendingVendors.map((vendor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {vendor.category === "Food & Beverage" && <Coffee className="h-6 w-6 text-white" />}
                            {vendor.category === "Electronics" && <Laptop className="h-6 w-6 text-white" />}
                            {vendor.category === "Academic" && <BookOpen className="h-6 w-6 text-white" />}
                          </div>
                          {vendor.trending && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{vendor.name}</h4>
                          <p className="text-sm text-slate-400">{vendor.category}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-slate-300 ml-1">{vendor.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          {vendor.discount}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg bg-slate-600/50`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-white truncate">{activity.title}</h5>
                        <p className="text-xs text-slate-400 mt-1">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">12</div>
                      <div className="text-xs text-slate-400">Messages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">8</div>
                      <div className="text-xs text-slate-400">Favorites</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">24</div>
                      <div className="text-xs text-slate-400">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">4.9</div>
                      <div className="text-xs text-slate-400">Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
