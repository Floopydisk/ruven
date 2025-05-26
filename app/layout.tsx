import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "University Vendor App",
  description: "Connect with vendors on your university campus",
    generator: 'v0.dev'
}

// Create a client wrapper for the AuthProvider
function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50">{children}</div>}>{children}</Suspense>
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
