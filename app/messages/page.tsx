"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, PlusCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/nav-bar"

// Types
type Conversation = {
  id: number
  vendorName: string
  vendorImage: string
  lastMessage: string
  timestamp: string
  unread: boolean
}

export default function MessagesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/messages")
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch conversations
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    }
  }, [isAuthenticated])

  const fetchConversations = async () => {
    setIsLoadingConversations(true)
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        setConversations([
          {
            id: 1,
            vendorName: "Campus Coffee",
            vendorImage: "/placeholder.svg?height=100&width=100",
            lastMessage: "Thanks for your order! It will be ready in 10 minutes.",
            timestamp: "10:23 AM",
            unread: true,
          },
          {
            id: 2,
            vendorName: "University Print Shop",
            vendorImage: "/placeholder.svg?height=100&width=100",
            lastMessage: "Your print job is complete and ready for pickup.",
            timestamp: "Yesterday",
            unread: false,
          },
          {
            id: 3,
            vendorName: "Tech Repair Hub",
            vendorImage: "/placeholder.svg?height=100&width=100",
            lastMessage: "We've diagnosed the issue with your laptop. The repair will cost $85.",
            timestamp: "Monday",
            unread: false,
          },
        ])
        setIsLoadingConversations(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setIsLoadingConversations(false)
    }
  }

  const filteredConversations = conversations.filter((conversation) =>
    conversation.vendorName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col">
        <NavBar />
        <div className="container px-4 py-6 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col pb-16 md:pb-0">
      <NavBar />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>

          <Link href="/messages/new">
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoadingConversations ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Link key={conversation.id} href={`/messages/${conversation.id}`}>
                <Card
                  className={`hover:border-primary/30 transition-colors ${conversation.unread ? "border-primary/50" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={conversation.vendorImage || "/placeholder.svg"}
                          alt={conversation.vendorName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className={`font-medium ${conversation.unread ? "font-semibold" : ""}`}>
                            {conversation.vendorName}
                          </h3>
                          <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                        </div>
                        <p
                          className={`text-sm truncate ${conversation.unread ? "text-foreground font-medium" : "text-muted-foreground"}`}
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
            <h3 className="text-lg font-medium mb-2">No conversations found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try a different search term" : "Start a new conversation with a vendor"}
            </p>
            <Link href="/browse">
              <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity">
                Browse Vendors
              </Button>
            </Link>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md z-10 md:hidden">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center py-2 px-4">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center py-2 px-4">
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Browse</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-2 px-4">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="text-xs mt-1 text-primary">Messages</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-2 px-4">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}
