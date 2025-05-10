"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Laptop, Smartphone, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Session {
  id: number
  token: string
  user_agent: string
  ip_address: string
  last_active: string
  created_at: string
  expires_at: string
}

interface ActiveSessionsTableProps {
  sessions: Session[]
}

export function ActiveSessionsTable({ sessions }: ActiveSessionsTableProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({})
  const [currentToken, setCurrentToken] = useState<string>("")

  // Get the current session token from the cookie
  useState(() => {
    const cookies = document.cookie.split(";")
    const authCookie = cookies.find((cookie) => cookie.trim().startsWith("auth_session="))
    if (authCookie) {
      setCurrentToken(authCookie.split("=")[1])
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString()
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  }

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      return <Smartphone className="h-4 w-4" />
    }
    return <Laptop className="h-4 w-4" />
  }

  const getDeviceType = (userAgent: string) => {
    if (!userAgent) return "Unknown device"

    if (userAgent.includes("iPhone")) return "iPhone"
    if (userAgent.includes("iPad")) return "iPad"
    if (userAgent.includes("Android")) return "Android device"
    if (userAgent.includes("Windows")) return "Windows PC"
    if (userAgent.includes("Mac")) return "Mac"
    if (userAgent.includes("Linux")) return "Linux"
    if (userAgent.includes("Mobile")) return "Mobile device"

    return "Desktop device"
  }

  const getBrowser = (userAgent: string) => {
    if (!userAgent) return ""

    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) return "Chrome"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari"
    if (userAgent.includes("Edg")) return "Edge"
    if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera"

    return ""
  }

  const handleTerminateSession = async (sessionId: number, token: string) => {
    // Don't allow terminating the current session
    if (token === currentToken) {
      toast({
        title: "Cannot terminate current session",
        description: "Please use the logout button to end your current session",
        variant: "destructive",
      })
      return
    }

    setIsLoading((prev) => ({ ...prev, [sessionId]: true }))

    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to terminate session")
      }

      toast({
        title: "Session terminated",
        description: "The session has been successfully terminated",
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error("Error terminating session:", error)
      toast({
        title: "Error",
        description: "Failed to terminate the session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [sessionId]: false }))
    }
  }

  const handleTerminateAllSessions = async () => {
    setIsLoading((prev) => ({ ...prev, all: true }))

    try {
      const response = await fetch(`/api/auth/sessions`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to terminate all sessions")
      }

      toast({
        title: "All sessions terminated",
        description: "All other sessions have been successfully terminated",
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error("Error terminating all sessions:", error)
      toast({
        title: "Error",
        description: "Failed to terminate all sessions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, all: false }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your active sessions</h3>
        <Button variant="outline" onClick={handleTerminateAllSessions} disabled={isLoading.all || sessions.length <= 1}>
          {isLoading.all ? "Terminating..." : "Terminate All Other Sessions"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const isCurrentSession = session.token === currentToken

            return (
              <TableRow key={session.id} className={isCurrentSession ? "bg-muted/50" : ""}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(session.user_agent)}
                    <div>
                      <div className="font-medium">{getDeviceType(session.user_agent)}</div>
                      <div className="text-xs text-muted-foreground">{getBrowser(session.user_agent)}</div>
                      {isCurrentSession && (
                        <Badge variant="outline" className="mt-1">
                          Current Session
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>{session.ip_address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>{getTimeSince(session.last_active)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(session.last_active)} at {formatTime(session.last_active)}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLoading[session.id] || isCurrentSession}
                    onClick={() => handleTerminateSession(session.id, session.token)}
                  >
                    {isLoading[session.id] ? "Terminating..." : "Terminate"}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
