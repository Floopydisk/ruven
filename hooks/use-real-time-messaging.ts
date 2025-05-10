"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import Pusher from "pusher-js"

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
  const [pusher, setPusher] = useState<Pusher | null>(null)
  const [channel, setChannel] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<number[]>([])
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const { user } = useAuth()

  // Initialize Pusher connection
  useEffect(() => {
    if (!user) return

    // Fetch Pusher configuration from server
    const initializePusher = async () => {
      try {
        // Get configuration from the server
        const response = await fetch("/api/config/pusher")

        if (!response.ok) {
          throw new Error("Failed to fetch Pusher configuration")
        }

        const config = await response.json()

        // Get the Pusher key from a secure endpoint
        const keyResponse = await fetch("/api/messaging/pusher-key")

        if (!keyResponse.ok) {
          throw new Error("Failed to fetch Pusher key")
        }

        const { key } = await keyResponse.json()

        // Initialize Pusher with config from server
        const pusherInstance = new Pusher(key, {
          cluster: config.cluster,
          authEndpoint: config.authEndpoint,
          forceTLS: true,
        })

        setPusher(pusherInstance)

        // Subscribe to private channel
        const channelName = `private-user-${user.id}`
        const userChannel = pusherInstance.subscribe(channelName)
        setChannel(userChannel)
      } catch (error) {
        console.error("Failed to initialize Pusher:", error)
        setError("Failed to initialize real-time messaging")
      }
    }

    initializePusher()

    // Clean up on unmount
    return () => {
      if (channel) {
        pusher?.unsubscribe(`private-user-${user.id}`)
      }
      if (pusher) {
        pusher.disconnect()
      }
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

  // Listen for new messages and events
  useEffect(() => {
    if (!channel || !user || !conversationId) return

    const handleNewMessage = (data: any) => {
      if (data.conversationId === conversationId) {
        const newMessage: Message = {
          id: data.messageId,
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
          sendReadReceipt(conversationId, newMessage.id)
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

    // Bind event handlers
    channel.bind("message", handleNewMessage)
    channel.bind("typing", handleTyping)
    channel.bind("read_receipt", handleReadReceipt)

    return () => {
      // Unbind event handlers
      channel.unbind("message", handleNewMessage)
      channel.unbind("typing", handleTyping)
      channel.unbind("read_receipt", handleReadReceipt)
    }
  }, [channel, conversationId, user])

  // Send read receipt
  const sendReadReceipt = async (conversationId: number, messageId: number) => {
    try {
      await fetch("/api/socketio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "read_receipt",
          data: {
            conversationId,
            messageId,
          },
        }),
      })
    } catch (error) {
      console.error("Error sending read receipt:", error)
    }
  }

  // Handle typing indicator
  const handleInputChange = useCallback(
    (text: string) => {
      if (!conversationId) return

      // Send typing indicator
      fetch("/api/socketio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "typing",
          data: {
            conversationId,
            isTyping: text.length > 0,
          },
        }),
      }).catch((error) => {
        console.error("Error sending typing indicator:", error)
      })

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }

      // Set new timeout to stop typing indicator after 3 seconds
      if (text.length > 0) {
        const timeout = setTimeout(() => {
          fetch("/api/socketio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event: "typing",
              data: {
                conversationId,
                isTyping: false,
              },
            }),
          }).catch((error) => {
            console.error("Error sending typing indicator:", error)
          })
        }, 3000)
        setTypingTimeout(timeout)
      }
    },
    [conversationId, typingTimeout],
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

        // Send via Pusher for real-time
        await fetch("/api/socketio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: "message",
            data: {
              conversationId,
              messageId: data.message.id,
              message: content,
              hasAttachment,
              attachmentUrl,
              attachmentType,
              attachmentName,
            },
          }),
        })

        // Clear typing indicator
        await fetch("/api/socketio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: "typing",
            data: {
              conversationId,
              isTyping: false,
            },
          }),
        })

        return true
      } catch (error) {
        console.error("Error sending message:", error)
        return false
      }
    },
    [conversationId, user],
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
