"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

export default function VendorProfilePage() {
  const [logoUrl, setLogoUrl] = useState<string>("/placeholder.svg?height=96&width=96")
  const [bannerUrl, setBannerUrl] = useState<string>("/placeholder.svg?height=400&width=800")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
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
      </header>

      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Images</CardTitle>
              <CardDescription>Upload your business logo and banner image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  This image will appear at the top of your vendor profile
                </p>
                <ImageUpload
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  onRemove={() => setBannerUrl("/placeholder.svg?height=400&width=800")}
                  aspectRatio="banner"
                  placeholder="Upload a banner image (1600×900 recommended)"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <p className="text-sm text-muted-foreground mb-2">This image will be used as your business logo</p>
                <ImageUpload
                  value={logoUrl}
                  onChange={setLogoUrl}
                  onRemove={() => setLogoUrl("/placeholder.svg?height=96&width=96")}
                  className="max-w-[200px]"
                  placeholder="Upload a logo (square format recommended)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your vendor profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" defaultValue="Campus Coffee" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  defaultValue="Campus Coffee is your go-to spot for premium coffee, tea, and snacks. Located in the heart of the university, we offer a cozy atmosphere for studying or catching up with friends."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="hello@campuscoffee.com" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="(555) 123-4567" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="Student Union Building, 1st Floor" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="hours">Business Hours</Label>
                <Input id="hours" defaultValue="Mon-Fri: 7am-7pm, Sat-Sun: 9am-5pm" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="https://campuscoffee.example.com" />
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
