"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ShieldAlert, Settings, Store, Loader2 } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { NavBar } from "@/components/nav-bar"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading, updateUserProfile, updatePassword } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg?height=300&width=300")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVendor, setIsVendor] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/profile")
    }

    if (user) {
      setName(user.name || `${user.firstName} ${user.lastName}`)
      setEmail(user.email || "")
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      }
      setIsVendor(user.isVendor || false)
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateUserProfile({
        name,
        profileImage,
      })

      toast({
        title: "Profile updated",
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
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      const result = await updatePassword(currentPassword, newPassword)

      if (result.success) {
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully.",
        })

        // Reset form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col pb-16">
      <NavBar />

      <div className="container px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {isVendor && <TabsTrigger value="vendor">Vendor Account</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profileImage">Profile Picture</Label>
                    <ImageUpload
                      value={profileImage}
                      onChange={setProfileImage}
                      onRemove={() => setProfileImage("/placeholder.svg?height=300&width=300")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={email} disabled />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your email address cannot be changed. Contact support if you need to update it.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <Card>
              <form onSubmit={handlePasswordChange}>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Updating..." : "Change Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and active sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Link href="/profile/security">
                    <Button variant="outline" size="sm">
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Active Sessions</h3>
                    <p className="text-sm text-muted-foreground">Manage your active sessions and devices</p>
                  </div>
                  <Link href="/profile/security?tab=sessions">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Security Logs</h3>
                    <p className="text-sm text-muted-foreground">View your recent security activity</p>
                  </div>
                  <Link href="/profile/security?tab=logs">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/profile/security" className="w-full">
                  <Button className="w-full">
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Manage Security Settings
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          {isVendor && (
            <TabsContent value="vendor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Account</CardTitle>
                  <CardDescription>Manage your vendor profile and business settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Business Profile</h3>
                      <p className="text-sm text-muted-foreground">Update your business information</p>
                    </div>
                    <Link href="/dashboard/vendor/profile">
                      <Button variant="outline" size="sm">
                        <Store className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Products & Services</h3>
                      <p className="text-sm text-muted-foreground">Manage your product listings</p>
                    </div>
                    <Link href="/dashboard/vendor/products">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </Link>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/vendor" className="w-full">
                    <Button className="w-full">
                      <Store className="h-4 w-4 mr-2" />
                      Go to Vendor Dashboard
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  )
}
