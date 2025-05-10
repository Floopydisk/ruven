"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Mail, CheckCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      setIsVerified(user.emailVerified || false)
    }
  }, [user])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendVerificationEmail = async () => {
    setIsSending(true)
    try {
      const response = await fetch("/api/auth/verify-email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification code.",
          variant: "default",
        })
        setCountdown(60) // 60 seconds cooldown
      } else {
        throw new Error("Failed to send verification email")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const verifyEmail = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code from your email.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      })

      if (response.ok) {
        setIsVerified(true)
        toast({
          title: "Success",
          description: "Your email has been verified successfully.",
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

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/profile" className="text-blue-400 flex items-center hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-blue-400">Verify Your Email</CardTitle>
            <CardDescription className="text-slate-400">
              Verify your email address to secure your account and access all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isVerified ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="rounded-full bg-green-500/20 p-4 mb-4">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Email Verified</h3>
                <p className="text-center text-slate-400 mb-4">Your email address has been successfully verified.</p>
                <Button onClick={() => router.push("/profile")} className="bg-blue-600 hover:bg-blue-700">
                  Return to Profile
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-blue-500/20 p-4">
                    <Mail className="h-12 w-12 text-blue-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-400 text-center">We've sent a verification code to:</p>
                  <p className="text-center font-medium">{email}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="verificationCode" className="text-sm text-slate-300">
                    Verification Code
                  </label>
                  <Input
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <Button onClick={verifyEmail} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">Didn't receive the code?</p>
                  <Button
                    variant="link"
                    onClick={sendVerificationEmail}
                    disabled={isSending || countdown > 0}
                    className="text-blue-400 h-auto p-0"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    {countdown > 0
                      ? `Resend code in ${countdown}s`
                      : isSending
                        ? "Sending..."
                        : "Resend verification code"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
