"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Loader2 } from "lucide-react"
import { MessageInput } from "@/components/message-input"

interface Vendor {
  id: number
  businessName: string
  logoImage?: string
}

export function NewMessageForm() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const response = await fetch(`/api/vendors/search?q=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setSearchResults(data.vendors)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleVendorSelect = async (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsCreatingConversation(true)

    try {
      // Check if conversation already exists
      const response = await fetch(`/api/messages/conversations/check?vendorId=${vendor.id}`)

      if (!response.ok) {
        throw new Error("Failed to check conversation")
      }

      const data = await response.json()

      if (data.exists) {
        // Conversation exists, redirect to it
        router.push(`/messages/${data.conversationId}`)
      } else {
        // Create new conversation
        const createResponse = await fetch("/api/messages/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vendorId: vendor.id }),
        })

        if (!createResponse.ok) {
          throw new Error("Failed to create conversation")
        }

        const createData = await createResponse.json()
        setConversationId(createData.conversationId)
      }
    } catch (error) {
      console.error("Error handling vendor selection:", error)
      alert("Failed to start conversation. Please try again.")
      setSelectedVendor(null)
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const handleMessageSent = () => {
    if (conversationId) {
      router.push(`/messages/${conversationId}`)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Message</CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedVendor ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for a vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center p-2 rounded-md hover:bg-secondary cursor-pointer"
                    onClick={() => handleVendorSelect(vendor)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={vendor.logoImage || "/placeholder.svg"} alt={vendor.businessName} />
                      <AvatarFallback>{vendor.businessName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{vendor.businessName}</span>
                  </div>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <p className="text-center text-muted-foreground py-4">No vendors found</p>
            ) : null}
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={selectedVendor.logoImage || "/placeholder.svg"} alt={selectedVendor.businessName} />
                <AvatarFallback>{selectedVendor.businessName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{selectedVendor.businessName}</div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-muted-foreground"
                  onClick={() => setSelectedVendor(null)}
                >
                  Change
                </Button>
              </div>
            </div>

            {isCreatingConversation ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : conversationId ? (
              <MessageInput conversationId={conversationId} onMessageSent={handleMessageSent} />
            ) : null}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/messages")}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
