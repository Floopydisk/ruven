"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Store, Loader2, MapPin, Clock, Phone, Globe } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { NavBar } from "@/components/nav-bar"

export default function VendorProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading, isVendor } = useAuth()
  const { toast } = useToast()

  const [businessName, setBusinessName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [businessHours, setBusinessHours] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [logoImage, setLogoImage] = useState<string>("/placeholder.svg?height=300&width=300")
  const [bannerImage, setBannerImage] = useState<string>("/placeholder.svg?height=200&width=800")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vendorData, setVendorData] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/profile/vendor")
    }

    if (!authLoading && user && !isVendor) {
      router.push("/sell")
    }

    if (user && isVendor) {
      fetchVendorData()
    }
  }, [user, authLoading, isVendor, router])

  const fetchVendorData = async () => {
    try {
      const res = await fetch("/api/vendors/check")
      if (res.ok) {
        const data = await res.json()
        if (data.vendor) {
          const vendor = data.vendor
          setBusinessName(vendor.businessName || "")
          setDescription(vendor.description || "")
          setLocation(vendor.location || "")
          setBusinessHours(vendor.businessHours || "")
          setPhone(vendor.phone || "")
          setWebsite(vendor.website || "")
          setLogoImage(vendor.logoImage || "/placeholder.svg?height=300&width=300")
          setBannerImage(vendor.bannerImage || "/placeholder.svg?height=200&width=800")
          setVendorData(vendor)
        }
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/vendors/${vendorData.id}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          description,
          location,
          businessHours,
          phone,
          website,
          logoImage,
          bannerImage,
        }),
      })

      if (res.ok) {
        toast({
          title: "Profile updated",
          description: "Your vendor profile has been updated successfully.",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading vendor profile...</p>
      </div>
    )
  }

  if (!user || !isVendor) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pb-16">
      <NavBar />

      <div className="container px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Vendor Profile
          </h1>
          <p className="text-slate-400">Manage your business information and settings</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Store className="h-5 w-5 mr-2 text-blue-400" />
                Business Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Update your business details to help customers find and connect with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logoImage" className="text-white">
                    Business Logo
                  </Label>
                  <ImageUpload
                    value={logoImage}
                    onChange={setLogoImage}
                    onRemove={() => setLogoImage("/placeholder.svg?height=300&width=300")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerImage" className="text-white">
                    Banner Image
                  </Label>
                  <ImageUpload
                    value={bannerImage}
                    onChange={setBannerImage}
                    onRemove={() => setBannerImage("/placeholder.svg?height=200&width=800")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-white">
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Business Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
                  placeholder="Tell customers about your business..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="e.g., Student Union Building, Room 101"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessHours" className="text-white flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Business Hours
                  </Label>
                  <Input
                    id="businessHours"
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="e.g., Mon-Fri 9AM-5PM"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="e.g., https://yourbusiness.com"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/dashboard/vendor">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Back to Dashboard
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  )
}
