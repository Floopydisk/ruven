"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, UserX, Mail, Key } from "lucide-react"

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  created_at: string
  two_factor_enabled: boolean
  email_verified: boolean
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({})

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleAction = async (userId: number, action: string) => {
    setIsLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      // Make API call to perform the action
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to perform action")
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      alert(`Failed to ${action} user. Please try again.`)
    } finally {
      setIsLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.id}</TableCell>
            <TableCell>
              {user.first_name} {user.last_name}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{formatDate(user.created_at)}</TableCell>
            <TableCell>
              <div className="flex space-x-1">
                {user.email_verified ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Unverified
                  </Badge>
                )}
                {user.two_factor_enabled && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    2FA
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAction(user.id, "reset-password")}>
                    <Key className="mr-2 h-4 w-4" />
                    Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction(user.id, "verify-email")}>
                    <Mail className="mr-2 h-4 w-4" />
                    Verify Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction(user.id, "make-admin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleAction(user.id, "delete")}
                    className="text-red-600 focus:text-red-600"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
