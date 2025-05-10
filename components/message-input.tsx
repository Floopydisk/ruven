"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, Loader2 } from "lucide-react"
import { FileAttachment } from "@/components/file-attachment"
import { io } from "socket.io-client"

interface MessageInputProps {
  conversationId: number
  onMessageSent?: () => void
}

export function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!message.trim() && !selectedFile) || isSending) {
      return
    }

    setIsSending(true)

    try {
      const formData = new FormData()
      formData.append("conversationId", conversationId.toString())
      formData.append("content", message)

      if (selectedFile) {
        formData.append("attachment", selectedFile)
      }

      const response = await fetch("/api/messages/send", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Clear input
      setMessage("")
      setSelectedFile(null)

      // Notify parent component
      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    // Emit typing event
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Emit typing event via socket
    try {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "")
      socket.emit("typing", { conversationId })

      const timeout = setTimeout(() => {
        // Clear typing status after 3 seconds
      }, 3000)

      setTypingTimeout(timeout)
    } catch (error) {
      console.error("Error emitting typing event:", error)
    }
  }

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form onSubmit={handleSendMessage} className="border-t p-4">
      {selectedFile && (
        <div className="mb-2 p-2 bg-secondary rounded flex items-center justify-between">
          <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={clearSelectedFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <FileAttachment onFileSelect={handleFileSelect} ref={fileInputRef} />

        <Input
          placeholder="Type your message..."
          value={message}
          onChange={handleInputChange}
          className="flex-1"
          disabled={isSending}
        />

        <Button
          type="submit"
          disabled={isSending || (!message.trim() && !selectedFile)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </form>
  )
}
