"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Send, Loader2, Search, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRealTimeMessaging } from "@/hooks/use-real-time-messaging"
import { TypingIndicator } from "@/components/typing-indicator"
import { MessageStatus } from "@/components/message-status"
import { FileAttachment, FilePreview } from "@/components/file-attachment"

export default function VendorConversationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, isVendor } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversationId = Number.parseInt(params.id)
  const {
    messages,
    isLoading: isLoadingMessages,
    error,
    sendMessage,
    handleInputChange,
    typingUsers,
    searchQuery,
    setSearchQuery,
  } = useRealTimeMessaging(conversationId)

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isVendor)) {
      router.push(`/auth/login?redirect=/dashboard/vendor/messages/${params.id}`)
    }
  }, [isLoading, isAuthenticated, isVendor, router, params.id])

  // Fetch conversation data
  useEffect(() => {
    if (isAuthenticated && isVendor && params.id) {
      fetchConversationData()
    }
  }, [isAuthenticated, isVendor, params.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isSearching) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isSearching])

  const fetchConversationData = async () => {
    try {
      // Fetch conversation details
      const conversationResponse = await fetch(`/api/messages/vendor/conversations/${params.id}`)
      if (conversationResponse.ok) {
        const conversationData = await conversationResponse.json()
        setUserData(conversationData.user)
      }
    } catch (error) {
      console.error("Error fetching conversation data:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!newMessage.trim() && !selectedFile) || !params.id) return

    setIsSending(true)

    try {
      const success = await sendMessage(newMessage, selectedFile)

      if (success) {
        setNewMessage("")
        setSelectedFile(null)
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChangeWithTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    handleInputChange(e.target.value)
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

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
          <Link href="/dashboard/vendor/messages" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Messages</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <h1 className="text-xl font-bold">Customer Conversation</h1>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>
                {userData ? (
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={userData.profileImage || "/placeholder.svg?height=40&width=40"}
                        alt={`${userData.firstName} ${userData.lastName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span>
                      {userData.firstName} {userData.lastName}
                    </span>
                  </div>
                ) : (
                  "Loading..."
                )}
              </CardTitle>
              <div className="flex items-center">
                {isSearching ? (
                  <div className="flex items-center">
                    <Input
                      placeholder="Search in conversation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-48 mr-2"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setIsSearching(false)
                        setSearchQuery("")
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSearching(true)}>
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 p-4 overflow-y-auto">
              {isLoadingMessages ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex justify-center p-4">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="bg-secondary/30 rounded-lg p-4 max-w-md">
                    <p className="text-sm text-center text-muted-foreground">
                      This is the beginning of your conversation with {userData?.firstName || "this customer"}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex ${message.isFromCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.isFromCurrentUser
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                            : "bg-secondary"
                        }`}
                      >
                        {message.hasAttachment && message.attachmentUrl && (
                          <FilePreview
                            url={message.attachmentUrl}
                            type={message.attachmentType || "application/octet-stream"}
                            name={message.attachmentName || "attachment"}
                          />
                        )}
                        {message.content && <p className="mt-2">{message.content}</p>}
                        <div
                          className={`flex items-center justify-between text-xs mt-1 ${
                            message.isFromCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {message.isFromCurrentUser && (
                            <MessageStatus
                              status={message.status}
                              className={message.isFromCurrentUser ? "text-primary-foreground/70" : ""}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {userData && typingUsers.includes(userData.id) && (
              <TypingIndicator typingUsers={typingUsers} vendorId={userData.id} />
            )}

            <form onSubmit={handleSendMessage} className="border-t p-4">
              <div className="flex gap-2 items-center">
                <FileAttachment onFileSelect={setSelectedFile} />
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={handleInputChangeWithTyping}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isSending || (!newMessage.trim() && !selectedFile)}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
