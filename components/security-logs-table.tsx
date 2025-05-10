"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface SecurityLog {
  id: number
  event_type: string
  ip_address: string
  created_at: string
  details?: any
}

interface SecurityLogsTableProps {
  logs: SecurityLog[]
}

export function SecurityLogsTable({ logs }: SecurityLogsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "login_success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Login Success</Badge>
      case "login_failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Login Failed</Badge>
      case "login_attempt":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Login Attempt</Badge>
      case "logout":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Logout</Badge>
      case "two_factor_challenge":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">2FA Challenge</Badge>
      case "two_factor_success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">2FA Success</Badge>
      case "two_factor_failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">2FA Failed</Badge>
      case "password_reset_request":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Password Reset Request</Badge>
      case "password_reset_success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Password Reset</Badge>
      case "email_verification_sent":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Verification Sent</Badge>
      case "email_verified":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Email Verified</Badge>
      case "profile_updated":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Profile Updated</Badge>
      case "session_created":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Session Created</Badge>
      case "session_terminated":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Session Terminated</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{eventType}</Badge>
    }
  }

  const formatUserAgent = (userAgent: string) => {
    if (!userAgent) return "Unknown"

    // Simple user agent parsing
    if (userAgent.includes("Mobile")) return "Mobile Device"
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS Device"
    if (userAgent.includes("Android")) return "Android Device"
    if (userAgent.includes("Windows")) return "Windows"
    if (userAgent.includes("Mac")) return "Mac"
    if (userAgent.includes("Linux")) return "Linux"

    return "Desktop"
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
              No security events found
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{getEventBadge(log.event_type)}</TableCell>
              <TableCell>{formatUserAgent(log.details?.userAgent || "")}</TableCell>
              <TableCell>{log.ip_address}</TableCell>
              <TableCell>{formatDate(log.created_at)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
