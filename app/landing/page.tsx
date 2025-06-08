"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ModernNavbar } from "@/components/modern-navbar"
import { FeatureCard } from "@/components/feature-card"
import { Globe3D } from "@/components/globe-3d"
import {
  ShoppingBag,
  MessageSquare,
  Star,
  Users,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Heart,
  Coffee,
  Laptop,
  BookOpen,
} from "lucide-react"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content:
        "UniVendor made it so easy to find the best coffee spots on campus. I've discovered amazing local vendors I never knew existed!",
      avatar: "SC",
    },
    {
      name: "Marcus Johnson",
      role: "Business Student",
      content:
        "As a vendor, this platform has transformed my business. Direct communication with students has increased my sales by 300%!",
      avatar: "MJ",
    },
    {
      name: "Emily Rodriguez",
      role: "Art Student",
      content:
        "The messaging feature is incredible. I can easily coordinate custom orders with vendors for my art supplies.",
      avatar: "ER",
    },
  ]

  const stats = [
    { number: "10K+", label: "Active Students", icon: Users },
    { number: "500+", label: "Campus Vendors", icon: ShoppingBag },
    { number: "50K+", label: "Messages Sent", icon: MessageSquare },
    { number: "4.9", label: "Average Rating", icon: Star },
  ]

  const features = [
    {
      icon: ShoppingBag,
      title: "Discover Local Vendors",
      description: "Find amazing food, services, and products right on your campus",
      gradient: "from-blue-500 to-purple-600",
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Chat directly with vendors for custom orders and inquiries",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Make informed decisions with authentic student reviews",
      gradient: "from-pink-500 to-red-600",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications about new vendors and promotions",
      gradient: "from-orange-500 to-yellow-600",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "Your data is protected with enterprise-grade security",
      gradient: "from-green-500 to-teal-600",
    },
    {
      icon: TrendingUp,
      title: "Vendor Analytics",
      description: "Vendors get insights to grow their campus business",
      gradient: "from-teal-500 to-blue-600",
    },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      <ModernNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Connecting Campus Communities</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Your Campus
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Marketplace
              </span>
              <span className="block">Reimagined</span>
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
              Discover amazing vendors, connect with local businesses, and transform your campus experience with
              UniVendor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-sm"
                >
                  Explore Vendors
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <Globe3D />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why Students & Vendors
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Love UniVendor
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              We've built the perfect platform to connect campus communities with powerful features designed for the
              modern university experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">What Our Community Says</h2>
            <p className="text-xl text-slate-300">
              Real stories from students and vendors who've transformed their campus experience
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-2xl font-medium text-white mb-8 leading-relaxed">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">{testimonials[currentTestimonial].name}</div>
                      <div className="text-slate-400">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? "bg-blue-500" : "bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Explore Campus Categories</h2>
            <p className="text-xl text-slate-300">From coffee to tech support, find everything you need on campus</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-8 text-center">
                <Coffee className="h-16 w-16 text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">Food & Beverage</h3>
                <p className="text-slate-300">Coffee shops, restaurants, food trucks, and more</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-8 text-center">
                <Laptop className="h-16 w-16 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">Tech & Services</h3>
                <p className="text-slate-300">Repair services, tutoring, printing, and tech support</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-500/30 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">Academic</h3>
                <p className="text-slate-300">Textbooks, supplies, study materials, and more</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Campus Experience?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students and vendors who are already part of the UniVendor community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              >
                Start as Student
              </Button>
            </Link>
            <Link href="/auth/register?type=vendor">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-sm"
              >
                Join as Vendor
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-slate-400">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span>Instant access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">UniVendor</span>
              </div>
              <p className="text-slate-400">Connecting campus communities through innovative marketplace solutions.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/browse" className="hover:text-white transition-colors">
                    Browse Vendors
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Heart className="h-6 w-6 text-red-400" />
                <span className="text-slate-400">Made with love for students</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 UniVendor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
