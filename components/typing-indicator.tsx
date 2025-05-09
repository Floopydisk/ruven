"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface TypingIndicatorProps {
  typingUsers: number[]
  vendorId: number
}

export function TypingIndicator({ typingUsers, vendorId }: TypingIndicatorProps) {
  const [vendorName, setVendorName] = useState<string>("")
  const { user } = useAuth()

  useEffect(() => {
    // Fetch vendor name if needed
    const fetchVendorName = async () => {
      try {
        const response = await fetch(`/api/vendors/${vendorId}`)
        if (response.ok) {
          const data = await response.json()
          setVendorName(data.vendor.businessName)
        }
      } catch (error) {
        console.error("Error fetching vendor name:", error)
      }
    }

    if (typingUsers.includes(vendorId) && !vendorName) {
      fetchVendorName()
    }
  }, [typingUsers, vendorId, vendorName])

  if (typingUsers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center p-2 text-sm text-muted-foreground">
      <div className="flex space-x-1 mr-2">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
      <span>{vendorName || "Someone"} is typing...</span>
    </div>
  )
}
