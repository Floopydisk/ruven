import { sql } from "@/lib/db-direct"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminNavbar } from "@/components/admin-navbar"
import { SecurityLogsTable } from "@/components/admin/security-logs-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

async function getSecurityLogs() {
  const logs = await sql`
    SELECT 
      sl.id, 
      sl.event_type, 
      sl.ip_address, 
      sl.created_at, 
      sl.details,
      u.email
    FROM security_logs sl
    LEFT JOIN users u ON sl.user_id = u.id
    ORDER BY sl.created_at DESC
    LIMIT 100
  `
  return logs
}

async function getLoginAttempts() {
  const logs = await sql`
    SELECT 
      sl.id, 
      sl.event_type, 
      sl.ip_address, 
      sl.created_at, 
      sl.details,
      u.email
    FROM security_logs sl
    LEFT JOIN users u ON sl.user_id = u.id
    WHERE sl.event_type IN ('login_attempt', 'login_success', 'login_failed')
    ORDER BY sl.created_at DESC
    LIMIT 50
  `
  return logs
}

async function getTwoFactorEvents() {
  const logs = await sql`
    SELECT 
      sl.id, 
      sl.event_type, 
      sl.ip_address, 
      sl.created_at, 
      sl.details,
      u.email
    FROM security_logs sl
    LEFT JOIN users u ON sl.user_id = u.id
    WHERE sl.event_type IN ('two_factor_challenge', 'two_factor_success', 'two_factor_failed')
    ORDER BY sl.created_at DESC
    LIMIT 50
  `
  return logs
}

async function getRateLimitEvents() {
  const logs = await sql`
    SELECT 
      sl.id, 
      sl.event_type, 
      sl.ip_address, 
      sl.created_at, 
      sl.details,
      u.email
    FROM security_logs sl
    LEFT JOIN users u ON sl.user_id = u.id
    WHERE sl.event_type = 'rate_limit_exceeded'
    ORDER BY sl.created_at DESC
    LIMIT 50
  `
  return logs
}

export default async function AdminSecurityPage() {
  const [allLogs, loginLogs, twoFactorLogs, rateLimitLogs] = await Promise.all([
    getSecurityLogs(),
    getLoginAttempts(),
    getTwoFactorEvents(),
    getRateLimitEvents(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Security Logs</h2>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="login">Login Events</TabsTrigger>
            <TabsTrigger value="2fa">Two-Factor Events</TabsTrigger>
            <TabsTrigger value="ratelimit">Rate Limiting</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Security Events</CardTitle>
                <CardDescription>Recent security events across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityLogsTable logs={allLogs} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Login Events</CardTitle>
                <CardDescription>Login attempts, successes, and failures</CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityLogsTable logs={loginLogs} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="2fa" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication Events</CardTitle>
                <CardDescription>2FA challenges and verifications</CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityLogsTable logs={twoFactorLogs} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratelimit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting Events</CardTitle>
                <CardDescription>Rate limit exceeded events</CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityLogsTable logs={rateLimitLogs} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
