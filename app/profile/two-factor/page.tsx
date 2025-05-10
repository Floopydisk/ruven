"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Copy, RefreshCw, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function TwoFactorPage() {
  const { user } = useAuth()
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function checkTwoFactorStatus() {
      try {
        const response = await fetch("/api/auth/two-factor/status")
        if (response.ok) {
          const data = await response.json()
          setIsEnabled(data.enabled)
        }
      } catch (error) {
        console.error("Failed to check 2FA status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkTwoFactorStatus()
  }, [])

  const setupTwoFactor = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/two-factor/setup", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
      } else {
        throw new Error("Failed to setup 2FA")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup two-factor authentication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyAndEnable = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code from your authenticator app.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/two-factor/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      })

      if (response.ok) {
        const data = await response.json()
        setBackupCodes(data.backupCodes)
        setShowBackupCodes(true)
        setIsEnabled(true)
        toast({
          title: "Success",
          description: "Two-factor authentication has been enabled for your account.",
          variant: "default",
        })
      } else {
        throw new Error("Invalid verification code")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/two-factor/disable", {
        method: "POST",
      })

      if (response.ok) {
        setIsEnabled(false)
        setQrCode("")
        setSecret("")
        setBackupCodes([])
        toast({
          title: "Success",
          description: "Two-factor authentication has been disabled for your account.",
          variant: "default",
        })
      } else {
        throw new Error("Failed to disable 2FA")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
      variant: "default",
    })
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
      variant: "default",
    })
  }

  if (isLoading && !qrCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <Link href="/profile" className="text-blue-400 flex items-center hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-blue-400">Two-Factor Authentication</h1>

        {isEnabled ? (
          <>
            {showBackupCodes ? (
              <Card className="bg-slate-900 border-slate-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-blue-400">Backup Codes</CardTitle>
                  <CardDescription className="text-slate-400">
                    Save these backup codes in a secure place. Each code can only be used once.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="p-2 bg-slate-800 rounded border border-slate-700 font-mono text-center"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={copyBackupCodes}
                    variant="outline"
                    className="w-full border-blue-500 text-blue-400 hover:bg-blue-950"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Codes
                  </Button>
                  <p className="mt-4 text-sm text-slate-400">
                    You can view these codes again in your security settings.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setShowBackupCodes(false)} className="w-full bg-blue-600 hover:bg-blue-700">
                      I've Saved My Backup Codes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900 border-slate-800 mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-400">Two-Factor Authentication</CardTitle>
                    <div className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Enabled
                    </div>
                  </div>
                  <CardDescription className="text-slate-400">
                    Your account is protected with two-factor authentication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="font-medium text-white">View Backup Codes</h3>
                      <p className="text-sm text-slate-400">Access your backup codes for account recovery</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowBackupCodes(true)}
                      className="border-blue-500 text-blue-400 hover:bg-blue-950"
                    >
                      View Codes
                    </Button>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="font-medium text-white">Generate New Backup Codes</h3>
                      <p className="text-sm text-slate-400">Generate new backup codes (invalidates existing codes)</p>
                    </div>
                    <Button variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-950">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-white">Disable Two-Factor Authentication</h3>
                      <p className="text-sm text-slate-400">This will make your account less secure</p>
                    </div>
                    <Button variant="destructive" onClick={disableTwoFactor}>
                      Disable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {qrCode ? (
              <Card className="bg-slate-900 border-slate-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-blue-400">Set Up Two-Factor Authentication</CardTitle>
                  <CardDescription className="text-slate-400">
                    Scan the QR code with your authenticator app and enter the verification code below.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <Image
                        src={qrCode || "/placeholder.svg"}
                        alt="QR Code for two-factor authentication"
                        width={200}
                        height={200}
                      />
                    </div>
                    <div className="text-sm text-slate-400 mb-2">Can't scan the QR code? Use this code instead:</div>
                    <div className="flex items-center bg-slate-800 p-2 rounded-md mb-4">
                      <code className="font-mono text-sm text-white mr-2">{secret}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(secret)} className="h-8 w-8 p-0">
                        <Copy className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verificationCode" className="text-slate-300">
                      Verification Code
                    </Label>
                    <Input
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <Button
                    onClick={verifyAndEnable}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Verifying..." : "Verify and Enable"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900 border-slate-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-blue-400">Two-Factor Authentication</CardTitle>
                  <CardDescription className="text-slate-400">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-slate-800 rounded-lg">
                    <Shield className="h-10 w-10 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-white mb-1">Enhanced Security</h3>
                      <p className="text-sm text-slate-400">
                        Two-factor authentication adds an additional layer of security to your account by requiring a
                        verification code from your mobile device in addition to your password.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-white">You'll need:</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start">
                        <div className="rounded-full bg-blue-500/20 p-1 mr-2 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-blue-400" />
                        </div>
                        An authenticator app like Google Authenticator, Authy, or Microsoft Authenticator
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-blue-500/20 p-1 mr-2 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-blue-400" />
                        </div>
                        A few minutes to complete the setup process
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={setupTwoFactor}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Setting up..." : "Set Up Two-Factor Authentication"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  )
}
