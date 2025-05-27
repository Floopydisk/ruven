import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserAnalytics, getSecurityAnalytics, getMessageAnalytics } from "@/lib/analytics-service"
import { Users, Shield, MessageSquare, TrendingUp, UserCheck, AlertTriangle } from "lucide-react"
import { redirect } from "next/navigation"

// Helper function to format dates
function formatDate(date: any): string {
  if (!date) return ""
  try {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return String(date)
  }
}

function formatMonth(date: any): string {
  if (!date) return ""
  try {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", { month: "short" })
  } catch {
    return String(date)
  }
}

// Simple chart components that properly handle data formatting
const SimpleLineChart = ({ data, xKey, yKey, title }: any) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => Number(d[yKey]) || 0))

  return (
    <div className="h-[300px] w-full relative">
      <div className="absolute top-0 left-0 right-0 text-center font-medium">{title}</div>
      <div className="flex items-end h-[250px] mt-8 w-full gap-1">
        {data.map((item, index) => {
          const value = Number(item[yKey]) || 0
          const height = maxValue > 0 ? (value / maxValue) * 200 : 0
          const label =
            xKey === "month"
              ? formatMonth(item[xKey])
              : xKey === "day"
                ? formatDate(item[xKey])
                : String(item[xKey] || "")

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="bg-primary w-4 rounded-t-sm" style={{ height: `${height}px` }}></div>
              <div className="text-xs mt-1 truncate w-full text-center" title={label}>
                {label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SimplePieChart = ({ data, valueKey, nameKey, title }: any) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0)
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  if (total === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full relative">
      <div className="absolute top-0 left-0 right-0 text-center font-medium">{title}</div>
      <div className="flex justify-center items-center h-[250px] mt-8">
        <div className="relative w-[200px] h-[200px]">
          {data.map((item, index) => {
            const value = Number(item[valueKey]) || 0
            const percentage = (value / total) * 100
            const startAngle =
              index === 0
                ? 0
                : data.slice(0, index).reduce((sum, d) => sum + ((Number(d[valueKey]) || 0) / total) * 360, 0)
            const endAngle = startAngle + (value / total) * 360

            return (
              <div key={index} className="absolute inset-0">
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <path
                    d={`M 50 50 L ${50 + 45 * Math.cos(((startAngle - 90) * Math.PI) / 180)} ${50 + 45 * Math.sin(((startAngle - 90) * Math.PI) / 180)} A 45 45 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${50 + 45 * Math.cos(((endAngle - 90) * Math.PI) / 180)} ${50 + 45 * Math.sin(((endAngle - 90) * Math.PI) / 180)} Z`}
                    fill={colors[index % colors.length]}
                  />
                </svg>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {data.map((item, index) => {
          const value = Number(item[valueKey]) || 0
          const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : "0"
          return (
            <div key={index} className="flex items-center text-xs">
              <div className="w-3 h-3 mr-1" style={{ backgroundColor: colors[index % colors.length] }}></div>
              <span>
                {String(item[nameKey] || "Unknown")}: {percentage}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SimpleBarChart = ({ data, xKey, yKey, title }: any) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => Number(d[yKey]) || 0))

  return (
    <div className="h-[300px] w-full relative">
      <div className="absolute top-0 left-0 right-0 text-center font-medium">{title}</div>
      <div className="flex items-end h-[250px] mt-8 w-full gap-1">
        {data.map((item, index) => {
          const value = Number(item[yKey]) || 0
          const height = maxValue > 0 ? (value / maxValue) * 200 : 0
          const label = String(item[xKey] || "")

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="bg-blue-500 w-6 rounded-t-sm" style={{ height: `${height}px` }}></div>
              <div className="text-xs mt-1 truncate w-full text-center" title={label}>
                {label.length > 10 ? `${label.substring(0, 10)}...` : label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Server-side authentication check
async function checkAdminAuth() {
  try {
    // In a real app, you would check the session/cookie here
    // For now, we'll just return true to allow access
    return true
  } catch (error) {
    return false
  }
}

export default async function AdminAnalyticsPage() {
  // Check authentication on the server side
  const isAuthorized = await checkAdminAuth()

  if (!isAuthorized) {
    redirect("/auth/login")
  }

  // Fetch analytics data with error handling
  let userAnalytics = null
  let securityAnalytics = null
  let messageAnalytics = null

  try {
    userAnalytics = await getUserAnalytics()
  } catch (error) {
    console.error("Error fetching user analytics:", error)
  }

  try {
    securityAnalytics = await getSecurityAnalytics()
  } catch (error) {
    console.error("Error fetching security analytics:", error)
  }

  try {
    messageAnalytics = await getMessageAnalytics()
  } catch (error) {
    console.error("Error fetching message analytics:", error)
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Simple navigation header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <nav className="ml-auto flex items-center space-x-4">
            <a href="/admin" className="text-sm font-medium hover:underline">
              Overview
            </a>
            <a href="/admin/users" className="text-sm font-medium hover:underline">
              Users
            </a>
            <a href="/admin/analytics" className="text-sm font-medium hover:underline text-primary">
              Analytics
            </a>
            <a href="/admin/security" className="text-sm font-medium hover:underline">
              Security
            </a>
          </nav>
        </div>
      </header>

      <div className="container px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Users Analytics */}
          <TabsContent value="users" className="space-y-6">
            {/* User Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{userAnalytics?.totalUsers || 0}</div>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">New Users (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{userAnalytics?.newUsers || 0}</div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Verified Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{userAnalytics?.verifiedUsers || 0}</div>
                    <UserCheck className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {userAnalytics?.totalUsers
                      ? `${Math.round((userAnalytics.verifiedUsers / userAnalytics.totalUsers) * 100)}% of total users`
                      : "0% of total users"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">2FA Enabled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{userAnalytics?.twoFactorUsers || 0}</div>
                    <Shield className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {userAnalytics?.totalUsers
                      ? `${Math.round((userAnalytics.twoFactorUsers / userAnalytics.totalUsers) * 100)}% of total users`
                      : "0% of total users"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart
                  data={userAnalytics?.userGrowth || []}
                  xKey="month"
                  yKey="count"
                  title="Monthly User Growth"
                />
              </CardContent>
            </Card>

            {/* Users by Role Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                  <CardDescription>Distribution of users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimplePieChart
                    data={userAnalytics?.usersByRole || []}
                    valueKey="count"
                    nameKey="role"
                    title="User Roles"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Verification Status</CardTitle>
                  <CardDescription>Verified vs. unverified users</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimplePieChart
                    data={[
                      { name: "Verified", value: userAnalytics?.verifiedUsers || 0 },
                      { name: "Unverified", value: userAnalytics?.unverifiedUsers || 0 },
                    ]}
                    valueKey="value"
                    nameKey="name"
                    title="Verification Status"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Analytics */}
          <TabsContent value="security" className="space-y-6">
            {/* Security Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Login Attempts (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{securityAnalytics?.loginAttempts || 0}</div>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Failed Logins (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{securityAnalytics?.failedLogins || 0}</div>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {securityAnalytics?.loginAttempts
                      ? `${Math.round((securityAnalytics.failedLogins / securityAnalytics.loginAttempts) * 100)}% failure rate`
                      : "0% failure rate"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rate Limit Events (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{securityAnalytics?.rateLimitExceeded || 0}</div>
                    <Shield className="h-5 w-5 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Security Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{securityAnalytics?.securityRisk || "Low"}</div>
                    <div
                      className={`h-5 w-5 rounded-full ${
                        securityAnalytics?.securityRisk === "High"
                          ? "bg-red-500"
                          : securityAnalytics?.securityRisk === "Medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Events Over Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>Security events over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart
                  data={securityAnalytics?.eventsOverTime || []}
                  xKey="day"
                  yKey="count"
                  title="Daily Security Events"
                />
              </CardContent>
            </Card>

            {/* Events by Type and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Events by Type</CardTitle>
                  <CardDescription>Distribution of security events by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={securityAnalytics?.eventsByType || []}
                    xKey="event_type"
                    yKey="count"
                    title="Event Types"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Events by Country</CardTitle>
                  <CardDescription>Top 10 countries by security events</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={securityAnalytics?.eventsByCountry || []}
                    xKey="country"
                    yKey="count"
                    title="Countries"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Analytics */}
          <TabsContent value="messages" className="space-y-6">
            {/* Message Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{messageAnalytics?.totalMessages || 0}</div>
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Recent Messages (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{messageAnalytics?.recentMessages || 0}</div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{messageAnalytics?.totalConversations || 0}</div>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{messageAnalytics?.averageResponseTime || 0} min</div>
                    <Shield className="h-5 w-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messages Per Day Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Message Activity</CardTitle>
                <CardDescription>Messages sent per day over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart
                  data={messageAnalytics?.messagesPerDay || []}
                  xKey="day"
                  yKey="count"
                  title="Daily Message Activity"
                />
              </CardContent>
            </Card>

            {/* Top Vendors Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Vendors by Message Volume</CardTitle>
                <CardDescription>Most active vendors in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={messageAnalytics?.topVendors || []}
                  xKey="business_name"
                  yKey="message_count"
                  title="Vendor Message Volume"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
