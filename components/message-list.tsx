"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageStatus } from "@/components/message-status"
import { FilePreview } from "@/components/file-attachment"
import { TypingIndicator } from "@/components/typing-indicator"
import { io } from "socket.io-client"

interface Message {
  id: number | string
  content: string
  isFromCurrentUser: boolean
  timestamp: string
  status?: "sent" | "delivered" | "read"
  hasAttachment?: boolean
  attachmentUrl?: string
  attachmentType?: string
  attachmentName?: string
  senderName?: string
  senderImage?: string
}

interface MessageListProps {
  conversationId: number
  currentUserId: number
}

export function MessageList({ conversationId, currentUserId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<number[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/messages/conversations/${conversationId}/messages`)

        if (!response.ok) {
          throw new Error("Failed to fetch messages")
        }

        const data = await response.json()
        setMessages(data.messages)
      } catch (error) {
        console.error("Error fetching messages:", error)
        setError("Failed to load messages. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Set up real-time updates
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "")

    socket.on("connect", () => {
      socket.emit("joinConversation", conversationId)
    })

    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("typing", (data) => {
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId]
          }
          return prev
        })

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
        }, 3000)
      }
    })

    return () => {
      socket.off("newMessage")
      socket.off("typing")
      socket.emit("leaveConversation", conversationId)
      socket.disconnect()
    }
  }, [conversationId, currentUserId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isFromCurrentUser ? "justify-end" : "justify-start"}`}>
              {!message.isFromCurrentUser && message.senderImage && (
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={message.senderImage || "/placeholder.svg"} alt={message.senderName || "Sender"} />
                  <AvatarFallback>
                    {message.senderName ? message.senderName.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isFromCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary"
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
                  {message.isFromCurrentUser && message.status && (
                    <MessageStatus
                      status={message.status}
                      className={message.isFromCurrentUser ? "text-primary-foreground/70" : ""}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {typingUsers.length > 0 && (
            <div className="flex items-start">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="bg-secondary rounded-lg p-3">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}
