import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "University Vendor App",
  description: "Connect with vendors on your university campus",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
    generator: 'v0.dev'
}

function NavigationWrapper() {
  return (
    <Suspense fallback={<div style={{ height: "64px" }} />}>
      <div className="pb-16 md:pb-0">{/* Navigation will be loaded here */}</div>
    </Suspense>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <div className="pb-16 md:pb-0">{children}</div>
            <Suspense fallback={null}>
              <NavigationWrapper />
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
