"use client"

import { useState, useEffect, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "@/contexts/auth-context"

type Message = {
  id?: number
  conversationId: number
  senderId: number
  content: string
  timestamp: string
  isFromCurrentUser: boolean
  status?: "sent" | "delivered" | "read"
  hasAttachment?: boolean
  attachmentUrl?: string
  attachmentType?: string
  attachmentName?: string
}

export function useRealTimeMessaging(conversationId: number) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<number[]>([])
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const { user } = useAuth()

  // Initialize socket connection
  useEffect(() => {
    if (!user) return

    const socketInstance = io("/api/socket")
    setSocket(socketInstance)

    socketInstance.on("connect", () => {
      console.log("Socket connected")
    })

    socketInstance.on("error", (err) => {
      console.error("Socket error:", err)
      setError("Connection error. Please try again.")
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  // Load initial messages
  useEffect(() => {
    if (!conversationId || !user) return

    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/messages/conversations/${conversationId}/messages`)

        if (!response.ok) {
          throw new Error("Failed to fetch messages")
        }

        const data = await response.json()
        setMessages(data.messages)
      } catch (err) {
        console.error("Error fetching messages:", err)
        setError("Failed to load messages")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [conversationId, user])

  // Filter messages based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredMessages(messages)
      return
    }

    const filtered = messages.filter((message) => message.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredMessages(filtered)
  }, [messages, searchQuery])

  // Listen for new messages
  useEffect(() => {
    if (!socket || !user) return

    const handleNewMessage = (data: any) => {
      if (data.conversationId === conversationId) {
        const newMessage: Message = {
          id: data.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.message,
          timestamp: data.timestamp,
          isFromCurrentUser: data.senderId === user.id,
          status: data.status,
          hasAttachment: data.hasAttachment,
          attachmentUrl: data.attachmentUrl,
          attachmentType: data.attachmentType,
          attachmentName: data.attachmentName,
        }

        setMessages((prev) => [...prev, newMessage])

        // Mark message as read if it's from someone else
        if (!newMessage.isFromCurrentUser && newMessage.id) {
          socket.emit("read_receipt", {
            conversationId,
            messageId: newMessage.id,
          })
        }
      }
    }

    const handleTyping = (data: any) => {
      if (data.conversationId === conversationId && data.userId !== user.id) {
        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId]
            }
            return prev
          })
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
        }
      }
    }

    const handleReadReceipt = (data: any) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === data.messageId) {
              return { ...msg, status: "read" }
            }
            return msg
          }),
        )
      }
    }

    socket.on("message", handleNewMessage)
    socket.on("typing", handleTyping)
    socket.on("read_receipt", handleReadReceipt)

    return () => {
      socket.off("message", handleNewMessage)
      socket.off("typing", handleTyping)
      socket.off("read_receipt", handleReadReceipt)
    }
  }, [socket, conversationId, user])

  // Handle typing indicator
  const handleInputChange = useCallback(
    (text: string) => {
      if (!socket || !conversationId) return

      // Send typing indicator
      socket.emit("typing", {
        conversationId,
        isTyping: text.length > 0,
      })

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }

      // Set new timeout to stop typing indicator after 3 seconds
      if (text.length > 0) {
        const timeout = setTimeout(() => {
          socket.emit("typing", {
            conversationId,
            isTyping: false,
          })
        }, 3000)
        setTypingTimeout(timeout)
      }
    },
    [socket, conversationId, typingTimeout],
  )

  // Send message function
  const sendMessage = useCallback(
    async (content: string, file: File | null = null) => {
      if ((!content.trim() && !file) || !conversationId || !user) return false

      try {
        let attachmentUrl = ""
        let attachmentType = ""
        let attachmentName = ""
        let hasAttachment = false

        // Upload file if provided
        if (file) {
          const formData = new FormData()
          formData.append("file", file)

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload file")
          }

          const uploadData = await uploadResponse.json()
          attachmentUrl = uploadData.url
          attachmentType = file.type
          attachmentName = file.name
          hasAttachment = true
        }

        // Send via API
        const response = await fetch("/api/messages/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            content,
            hasAttachment,
            attachmentUrl,
            attachmentType,
            attachmentName,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }

        const data = await response.json()

        // Add to local messages
        const newMessage: Message = {
          id: data.message.id,
          conversationId,
          senderId: user.id,
          content,
          timestamp: new Date().toISOString(),
          isFromCurrentUser: true,
          status: "sent",
          hasAttachment,
          attachmentUrl,
          attachmentType,
          attachmentName,
        }

        setMessages((prev) => [...prev, newMessage])

        // Emit via socket for real-time
        if (socket) {
          socket.emit("message", {
            conversationId,
            messageId: data.message.id,
            message: content,
            hasAttachment,
            attachmentUrl,
            attachmentType,
            attachmentName,
          })
        }

        // Clear typing indicator
        if (socket) {
          socket.emit("typing", {
            conversationId,
            isTyping: false,
          })
        }

        return true
      } catch (error) {
        console.error("Error sending message:", error)
        return false
      }
    },
    [conversationId, user, socket],
  )

  return {
    messages: searchQuery ? filteredMessages : messages,
    isLoading,
    error,
    sendMessage,
    handleInputChange,
    typingUsers,
    searchQuery,
    setSearchQuery,
  }
}
