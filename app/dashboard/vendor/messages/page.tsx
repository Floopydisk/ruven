"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ArrowLeft, MessageSquare, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

type Conversation = {
  id: number
  userName: string
  userImage: string | null
  lastMessage: string
  timestamp: string
  unread: boolean
}

export default function VendorMessagesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, isVendor } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isVendor)) {
      router.push("/auth/login?redirect=/dashboard/vendor/messages")
    }
  }, [isLoading, isAuthenticated, isVendor, router])

  // Fetch conversations
  useEffect(() => {
    if (isAuthenticated && isVendor) {
      fetchConversations()
    }
  }, [isAuthenticated, isVendor])

  const fetchConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const response = await fetch("/api/messages/vendor/conversations")

      if (!response.ok) {
        throw new Error("Failed to fetch conversations")
      }

      const data = await response.json()
      setConversations(data.conversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const filteredConversations = conversations.filter((conversation) => {
    // Filter by search query
    const matchesSearch =
      conversation.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    if (activeTab === "unread") return matchesSearch && conversation.unread

    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="container px-4 py-6 flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
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
            <h1 className="text-xl font-bold">Customer Messages</h1>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 flex-1">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Messages</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                </TabsList>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search conversations..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="all" className="space-y-4">
                {isLoadingConversations ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="space-y-2">
                    {filteredConversations.map((conversation) => (
                      <Link key={conversation.id} href={`/dashboard/vendor/messages/${conversation.id}`}>
                        <Card
                          className={`hover:border-primary/30 transition-colors ${
                            conversation.unread ? "border-primary/50" : ""
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                <Image
                                  src={conversation.userImage || "/placeholder.svg?height=100&width=100"}
                                  alt={conversation.userName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between items-center">
                                  <h3 className={`font-medium ${conversation.unread ? "font-semibold" : ""}`}>
                                    {conversation.userName}
                                  </h3>
                                  <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                                </div>
                                <p
                                  className={`text-sm truncate ${
                                    conversation.unread ? "text-foreground font-medium" : "text-muted-foreground"
                                  }`}
                                >
                                  {conversation.lastMessage}
                                </p>
                              </div>
                              {conversation.unread && <div className="ml-2 h-2 w-2 rounded-full bg-primary"></div>}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No conversations found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery
                        ? "Try a different search term"
                        : "You don't have any messages yet. Customers will appear here when they message you."}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unread" className="space-y-4">
                {isLoadingConversations ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="space-y-2">
                    {filteredConversations.map((conversation) => (
                      <Link key={conversation.id} href={`/dashboard/vendor/messages/${conversation.id}`}>
                        <Card
                          className={`hover:border-primary/30 transition-colors ${
                            conversation.unread ? "border-primary/50" : ""
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                <Image
                                  src={conversation.userImage || "/placeholder.svg?height=100&width=100"}
                                  alt={conversation.userName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between items-center">
                                  <h3 className={`font-medium ${conversation.unread ? "font-semibold" : ""}`}>
                                    {conversation.userName}
                                  </h3>
                                  <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                                </div>
                                <p
                                  className={`text-sm truncate ${
                                    conversation.unread ? "text-foreground font-medium" : "text-muted-foreground"
                                  }`}
                                >
                                  {conversation.lastMessage}
                                </p>
                              </div>
                              {conversation.unread && <div className="ml-2 h-2 w-2 rounded-full bg-primary"></div>}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No unread messages</h3>
                    <p className="text-muted-foreground mb-6">You've read all your messages!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
