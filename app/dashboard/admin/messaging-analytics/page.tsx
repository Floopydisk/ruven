import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data - in a real app, this would come from your database
const messageData = [
  { date: "Jan 1", count: 45, activeUsers: 32 },
  { date: "Jan 8", count: 52, activeUsers: 38 },
  { date: "Jan 15", count: 49, activeUsers: 35 },
  { date: "Jan 22", count: 63, activeUsers: 42 },
  { date: "Jan 29", count: 58, activeUsers: 40 },
  { date: "Feb 5", count: 64, activeUsers: 45 },
  { date: "Feb 12", count: 72, activeUsers: 51 },
  { date: "Feb 19", count: 68, activeUsers: 48 },
  { date: "Feb 26", count: 75, activeUsers: 52 },
]

const responseTimeData = [
  { date: "Jan 1", avgTime: 12 },
  { date: "Jan 8", avgTime: 10 },
  { date: "Jan 15", avgTime: 14 },
  { date: "Jan 22", avgTime: 8 },
  { date: "Jan 29", avgTime: 9 },
  { date: "Feb 5", avgTime: 7 },
  { date: "Feb 12", avgTime: 6 },
  { date: "Feb 19", avgTime: 8 },
  { date: "Feb 26", avgTime: 5 },
]

export default function MessagingAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messaging Analytics</h1>
        <p className="text-muted-foreground mt-2">Track and analyze messaging activity across the platform.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="response-times">Response Times</TabsTrigger>
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Volume</CardTitle>
              <CardDescription>Total messages sent over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  count: {
                    label: "Message Count",
                    color: "hsl(var(--chart-1))",
                  },
                  activeUsers: {
                    label: "Active Users",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={messageData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-count)"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="var(--color-activeUsers)"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Total Messages</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">546</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 12%</span> from previous period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Conversations</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">128</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 8%</span> from previous period
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="response-times" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Average Response Time</CardTitle>
              <CardDescription>Average time to respond to messages (in hours)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  avgTime: {
                    label: "Response Time (hours)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={responseTimeData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="var(--color-avgTime)"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fastest Response</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">5 min</div>
                <p className="text-sm text-muted-foreground mt-2">By vendor: TechSupplies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slowest Response</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">24 hrs</div>
                <p className="text-sm text-muted-foreground mt-2">By vendor: CampusEssentials</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>User activity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">New Conversations</div>
                    <div className="text-2xl font-bold">42</div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Messages per User</div>
                    <div className="text-2xl font-bold">4.2</div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Active Users</div>
                    <div className="text-2xl font-bold">52</div>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Most Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { name: "Alex Johnson", messages: 24, lastActive: "2 hours ago" },
                        { name: "Sarah Williams", messages: 18, lastActive: "1 day ago" },
                        { name: "Michael Brown", messages: 15, lastActive: "3 hours ago" },
                        { name: "Emily Davis", messages: 12, lastActive: "5 hours ago" },
                        { name: "David Wilson", messages: 10, lastActive: "1 hour ago" },
                      ].map((user, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">Last active: {user.lastActive}</div>
                          </div>
                          <div className="text-sm font-medium">{user.messages} messages</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
