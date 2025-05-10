import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminNavbar } from "@/components/admin-navbar"
import { AdminStats } from "@/components/admin/admin-stats"
import { UsersTable } from "@/components/admin/users-table"
import { SecurityLogsTable } from "@/components/admin/security-logs-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { neon } from "@neondatabase/serverless"

// Check if user is admin
async function isAdmin() {
  const authSession = cookies().get("auth_session")?.value

  if (!authSession) {
    return false
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`
      SELECT u.role FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.session_token = ${authSession}
    `

    return result.length > 0 && result[0].role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export default async function AdminPage() {
  // Check if user is admin
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar />

      <div className="container px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, monitor system activity, and view analytics.</p>
        </div>

        <AdminStats />

        <Tabs defaultValue="users" className="mt-8">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage user accounts</CardDescription>
                  </div>
                  <Link href="/admin/users">
                    <Button variant="outline">View All Users</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <UsersTable limit={5} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Security Logs</CardTitle>
                    <CardDescription>Recent security events</CardDescription>
                  </div>
                  <Link href="/admin/security">
                    <Button variant="outline">View All Logs</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <SecurityLogsTable limit={5} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
