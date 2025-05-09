"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, Search, MessageSquare, User } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=200&width=200")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
  }

  return (
    <main className="flex min-h-screen flex-col pb-16 md:pb-0">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-xl">
            UniVendor
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <ImageUpload
                    value={profileImage}
                    onChange={setProfileImage}
                    onRemove={() => setProfileImage("/placeholder.svg?height=200&width=200")}
                    className="max-w-[200px]"
                    placeholder="Upload a profile picture"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="(555) 987-6543" />
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Vendors</CardTitle>
                <CardDescription>Vendors you've saved</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">You haven't saved any vendors yet.</p>
                <Link href="/browse">
                  <Button className="mt-4">Browse Vendors</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-10 md:hidden">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center py-2 px-4">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center py-2 px-4">
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Browse</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-2 px-4">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Messages</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-2 px-4">
            <User className="h-5 w-5 text-primary" />
            <span className="text-xs mt-1 text-primary">Profile</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}
