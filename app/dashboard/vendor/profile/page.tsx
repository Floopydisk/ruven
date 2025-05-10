"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { ShoppingBag, ArrowLeft, Loader2 } from "lucide-react"

type VendorProfile = {
  id: number
  userId: number
  businessName: string
  description: string | null
  location: string | null
  website: string | null
  phone: string | null
  logoImage: string | null
  bannerImage: string | null
}

export default function VendorProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [logoImage, setLogoImage] = useState<string>("/placeholder.svg?height=200&width=200")
  const [bannerImage, setBannerImage] = useState<string>("/placeholder.svg?height=400&width=800")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVendorProfile() {
      if (!user) return

      try {
        // First get vendor ID
        const vendorResponse = await fetch(`/api/vendors/check?userId=${user.id}`)
        if (!vendorResponse.ok) {
          throw new Error("Failed to verify vendor status")
        }

        const vendorData = await vendorResponse.json()
        if (!vendorData.isVendor || !vendorData.vendor) {
          setError("You don't have a vendor account yet")
          setIsLoading(false)
          return
        }

        const vendorId = vendorData.vendor.id

        // Then load vendor profile
        const profileResponse = await fetch(`/api/vendors/${vendorId}/profile`)
        if (!profileResponse.ok) {
          throw new Error("Failed to load vendor profile")
        }

        const profileData = await profileResponse.json()
        setVendorProfile(profileData.vendor)

        // Set images if available
        if (profileData.vendor.logoImage) {
          setLogoImage(profileData.vendor.logoImage)
        }
        if (profileData.vendor.bannerImage) {
          setBannerImage(profileData.vendor.bannerImage)
        }
      } catch (error) {
        console.error("Error loading vendor profile:", error)
        setError("Failed to load profile. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadVendorProfile()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vendorProfile) {
      return
    }

    setIsSaving(true)

    try {
      // Get form data
      const formData = new FormData(e.target as HTMLFormElement)
      const businessName = formData.get("businessName") as string
      const description = formData.get("description") as string
      const location = formData.get("location") as string
      const website = formData.get("website") as string
      const phone = formData.get("phone") as string

      const profileData = {
        businessName,
        description,
        location,
        website,
        phone,
        logoImage,
        bannerImage,
      }

      // Update vendor profile
      const response = await fetch(`/api/vendors/${vendorProfile.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/dashboard/vendor">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/dashboard/vendor" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <ShoppingBag className="h-6 w-6 mr-2" />
              <span className="font-bold text-xl">UniVendor</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 container px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Business Profile</h1>
          <p className="text-muted-foreground">Update your business information and settings</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  defaultValue={vendorProfile?.businessName || ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={vendorProfile?.description || ""}
                  placeholder="Describe your business, products, or services"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={vendorProfile?.location || ""}
                    placeholder="e.g., Student Center, 2nd Floor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    defaultValue={vendorProfile?.website || ""}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={vendorProfile?.phone || ""}
                  placeholder="(123) 456-7890"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Business Images</CardTitle>
              <CardDescription>Upload your business logo and banner images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logoImage">Logo Image</Label>
                <ImageUpload
                  value={logoImage}
                  onChange={setLogoImage}
                  onRemove={() => setLogoImage("/placeholder.svg?height=200&width=200")}
                  aspectRatio="square"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerImage">Banner Image</Label>
                <ImageUpload
                  value={bannerImage}
                  onChange={setBannerImage}
                  onRemove={() => setBannerImage("/placeholder.svg?height=400&width=800")}
                  aspectRatio="landscape"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/vendor")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
