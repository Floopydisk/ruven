import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/nav-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { getCurrentUser } from "@/lib/auth"
import { PlusCircle, MessageSquare, Store, User } from "lucide-react"

export const dynamic = "force-dynamic"

async function getConversations() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/messages/conversations`,
      {
        cache: "no-store",
      },
    )

    if (!res.ok) {
      throw new Error("Failed to fetch conversations")
    }

    const data = await res.json()
    return data.conversations || []
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return []
  }
}

export default async function MessagesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const conversations = await getConversations()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pb-16 md:pb-0">
      <NavBar />

      <div className="container px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-slate-400 mt-1">Stay connected with vendors and customers</p>
          </div>
          <Link href="/browse">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Find Vendors
            </Button>
          </Link>
        </div>

        {conversations.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-blue-500/20 p-6 mb-6">
                <MessageSquare className="h-12 w-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">No messages yet</h3>
              <p className="text-slate-400 text-center mb-8 max-w-md">
                Start a conversation with a vendor to inquire about their products or services, or wait for customers to
                reach out to you.
              </p>
              <div className="flex gap-4">
                <Link href="/browse">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Browse Vendors</Button>
                </Link>
                <Link href="/sell">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Become a Vendor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="px-6 py-4 border-b border-slate-700">
              <CardTitle className="text-lg text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                Recent Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-700">
                {conversations.map((conversation: any) => (
                  <Link key={conversation.id} href={`/messages/${conversation.id}`}>
                    <div className="flex items-center p-6 hover:bg-slate-700/30 transition-colors group">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                        <Image
                          src={conversation.otherPartyImage || "/placeholder.svg"}
                          alt={conversation.otherPartyName}
                          fill
                          className="object-cover"
                        />
                        {/* User type indicator */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                          {conversation.type === "vendor" ? (
                            <User className="h-3 w-3 text-blue-400" />
                          ) : (
                            <Store className="h-3 w-3 text-purple-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-semibold truncate text-white group-hover:text-blue-400 transition-colors">
                            {conversation.otherPartyName}
                          </h3>
                          <span className="text-xs text-slate-500 ml-2 whitespace-nowrap">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-400 truncate flex-1">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                          <div className="flex items-center ml-2">
                            <span className="text-xs text-slate-500 mr-2">
                              {conversation.type === "vendor" ? "Customer" : "Vendor"}
                            </span>
                            {conversation.unread && (
                              <div className="bg-blue-500 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                                •
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
