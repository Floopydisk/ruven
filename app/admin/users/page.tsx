import { sql } from "@/lib/db-direct"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminNavbar } from "@/components/admin-navbar"
import { UsersTable } from "@/components/admin/users-table"

export const dynamic = "force-dynamic"

async function getUsers() {
  const users = await sql`
    SELECT 
      id, 
      email, 
      first_name, 
      last_name, 
      created_at, 
      two_factor_enabled, 
      email_verified,
      role
    FROM users
    ORDER BY created_at DESC
    LIMIT 100
  `
  return users
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable users={users} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
