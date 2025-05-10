"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface SecurityLog {
  id: number
  event_type: string
  ip_address: string
  created_at: string
  email?: string
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
      case "two_factor_challenge":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">2FA Challenge</Badge>
      case "two_factor_success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">2FA Success</Badge>
      case "two_factor_failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">2FA Failed</Badge>
      case "password_reset":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Password Reset</Badge>
      case "email_verified":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Email Verified</Badge>
      case "rate_limit_exceeded":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rate Limited</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{eventType}</Badge>
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>User</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{log.id}</TableCell>
            <TableCell>{getEventBadge(log.event_type)}</TableCell>
            <TableCell>{log.email || "Anonymous"}</TableCell>
            <TableCell>{log.ip_address}</TableCell>
            <TableCell>{formatDate(log.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
