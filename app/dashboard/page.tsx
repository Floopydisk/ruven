import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, ShoppingBag, User } from "lucide-react"

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      <div className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Profile Settings</div>
              <p className="text-xs text-muted-foreground mt-1">Manage your personal information</p>
              <Link href="/profile" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Unread messages</p>
              <Link href="/messages" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  View Messages
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Browse Vendors</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Discover</div>
              <p className="text-xs text-muted-foreground mt-1">Find vendors on campus</p>
              <Link href="/browse" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Browse Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mt-10 mb-4">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to UniVendor!</CardTitle>
            <CardDescription>Your dashboard is ready to use</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This is your personal dashboard where you can manage your profile, view messages, and access all features
              of the UniVendor app.
            </p>
            <p className="mt-2">Start by browsing vendors or updating your profile information.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
