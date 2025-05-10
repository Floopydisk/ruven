"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Smartphone, Copy, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface TwoFactorSettingsProps {
  userId: number
  enabled: boolean
  emailVerified: boolean
}

export function TwoFactorSettings({ userId, enabled, emailVerified }: TwoFactorSettingsProps) {
  const { toast } = useToast()
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  const setupTwoFactor = async () => {
    if (!emailVerified) {
      toast({
        title: "Email verification required",
        description: "Please verify your email address before setting up two-factor authentication",
        variant: "destructive",
      })
      return
    }

    setIsSettingUp(true)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/two-factor/setup", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to set up two-factor authentication")
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setSecret(data.secret)
    } catch (error) {
      console.error("Error setting up 2FA:", error)
      toast({
        title: "Error",
        description: "Failed to set up two-factor authentication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit verification code",
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

      if (!response.ok) {
        throw new Error("Failed to verify code")
      }

      const data = await response.json()
      setBackupCodes(data.backupCodes)
      setShowBackupCodes(true)
      setIsEnabled(true)
      setIsSettingUp(false)

      toast({
        title: "Two-factor authentication enabled",
        description: "Your account is now protected with two-factor authentication",
      })
    } catch (error) {
      console.error("Error verifying 2FA:", error)
      toast({
        title: "Error",
        description: "Failed to verify the code. Please make sure you entered the correct code.",
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

      if (!response.ok) {
        throw new Error("Failed to disable two-factor authentication")
      }

      setIsEnabled(false)
      toast({
        title: "Two-factor authentication disabled",
        description: "Two-factor authentication has been disabled for your account",
      })
    } catch (error) {
      console.error("Error disabling 2FA:", error)
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
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard",
    })
  }

  const downloadBackupCodes = () => {
    if (!backupCodes.length) return

    const content = `UniVendor Backup Codes\n\nKeep these backup codes in a safe place. Each code can only be used once.\n\n${backupCodes.join("\n")}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "univendor-backup-codes.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!emailVerified) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Email verification required</AlertTitle>
        <AlertDescription>
          You need to verify your email address before you can enable two-factor authentication.
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/profile/email")}>
              Verify Email
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (isEnabled && !isSettingUp && !showBackupCodes) {
    return (
      <div className="space-y-4">
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Two-factor authentication is enabled</AlertTitle>
          <AlertDescription>
            Your account is protected with two-factor authentication. You'll need to enter a verification code when you
            sign in.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          <Button variant="destructive" onClick={disableTwoFactor} disabled={isLoading}>
            {isLoading ? "Disabling..." : "Disable Two-Factor Authentication"}
          </Button>
        </div>
      </div>
    )
  }

  if (showBackupCodes) {
    return (
      <div className="space-y-4">
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Save your backup codes</AlertTitle>
          <AlertDescription>
            Keep these backup codes in a safe place. If you lose your authenticator device, you can use one of these
            codes to sign in. Each code can only be used once.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-muted rounded-md font-mono text-center">
                  {code}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => copyToClipboard(backupCodes.join("\n"))}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Codes
          </Button>
          <Button onClick={downloadBackupCodes}>Download Backup Codes</Button>
        </div>

        <div className="pt-4">
          <Button variant="default" onClick={() => setShowBackupCodes(false)} className="w-full">
            Done
          </Button>
        </div>
      </div>
    )
  }

  if (isSettingUp) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {qrCode && (
            <div className="border p-4 rounded-lg bg-white">
              <Image src={qrCode || "/placeholder.svg"} alt="QR Code" width={200} height={200} />
            </div>
          )}

          {secret && (
            <div className="flex items-center space-x-2">
              <code className="bg-muted p-2 rounded font-mono text-sm">{secret}</code>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(secret)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="text-center max-w-md">
            <h3 className="font-medium mb-2">Scan the QR code with your authenticator app</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan the QR code.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2">
            <Label htmlFor="verification-code">Enter verification code</Label>
            <Input
              id="verification-code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-center text-xl tracking-widest"
            />
          </div>

          <div className="flex space-x-2 w-full max-w-xs">
            <Button variant="outline" onClick={() => setIsSettingUp(false)} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            <Button onClick={verifyTwoFactor} disabled={isLoading || verificationCode.length !== 6} className="flex-1">
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Two-factor authentication</h3>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account by requiring a verification code in addition to your
            password.
          </p>
        </div>
      </div>

      <Button onClick={setupTwoFactor} disabled={isLoading}>
        <Smartphone className="mr-2 h-4 w-4" />
        {isLoading ? "Setting up..." : "Set up two-factor authentication"}
      </Button>
    </div>
  )
}
