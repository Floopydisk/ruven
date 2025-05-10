"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ShieldAlert, Key, LogOut } from "lucide-react"
import { TwoFactorSettings } from "@/components/two-factor-settings"
import { SecurityLogsTable } from "@/components/security-logs-table"
import { ActiveSessionsTable } from "@/components/active-sessions-table"
import { useAuth } from "@/contexts/auth-context"

export default function SecurityPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("2fa")

  if (!user) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/profile" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Profile</span>
          </Link>
        </div>
      </div>

      <div className="container px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Security Settings</h1>
          <p className="text-muted-foreground">Manage your account security and active sessions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="2fa" className="flex items-center">
              <Key className="h-4 w-4 mr-2" />
              Two-Factor Authentication
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Active Sessions
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center">
              <ShieldAlert className="h-4 w-4 mr-2" />
              Security Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="2fa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account by enabling two-factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TwoFactorSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active sessions and sign out from other devices</CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveSessionsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Logs</CardTitle>
                <CardDescription>Review recent security events related to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityLogsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
