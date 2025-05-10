import type React from "react"
import { AdminNavbar } from "@/components/admin-navbar"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar />
      <div className="flex-1 container py-6 md:py-8">{children}</div>
    </div>
  )
}
