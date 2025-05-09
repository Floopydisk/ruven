"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Send } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NavBar } from "@/components/nav-bar"

export default function NewMessagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [vendorData, setVendorData] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Get vendor ID from URL query parameter
  useEffect(() => {
    const id = searchParams.get("vendor")
    if (id) {
      setVendorId(id)
      fetchVendorData(id)
    }
  }, [searchParams])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/messages/new" + (vendorId ? `?vendor=${vendorId}` : ""))
    }
  }, [isLoading, isAuthenticated, router, vendorId])

  // Fetch vendor data
  const fetchVendorData = async (id: string) => {
    try {
      const response = await fetch(`/api/vendors/${id}`)
      if (response.ok) {
        const data = await response.json()
        setVendorData(data.vendor)
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !vendorId) return

    setIsSending(true)

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorId: Number.parseInt(vendorId),
          content: message,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/messages/${data.conversationId}`)
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
    <main className="flex min-h-screen flex-col">
      <NavBar />

      <div className="container px-4 py-6 flex-1 flex flex-col">
        <div className="flex items-center mb-6">
          <Link href="/messages" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">New Message</h1>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>
              {vendorData ? (
                <div className="flex items-center">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={vendorData.logoImage || "/placeholder.svg?height=40&width=40"}
                      alt={vendorData.businessName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span>{vendorData.businessName}</span>
                </div>
              ) : (
                "Select a Vendor"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {!vendorId && (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Please select a vendor to message</p>
                  <Link href="/browse">
                    <Button>Browse Vendors</Button>
                  </Link>
                </div>
              </div>
            )}

            {vendorId && (
              <>
                <div className="flex-1 p-6">
                  <div className="bg-secondary/30 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-center text-muted-foreground">
                      This is the beginning of your conversation with {vendorData?.businessName || "this vendor"}.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Button type="submit" disabled={isSending || !message.trim()}>
                      {isSending ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
