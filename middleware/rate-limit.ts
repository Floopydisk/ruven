import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { sql } from "@/lib/db-direct"

// Simple in-memory store for rate limiting
// In production, use Redis or a similar distributed store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes in milliseconds
const MAX_REQUESTS = {
  login: 5,
  register: 3,
  resetPassword: 3,
  default: 100,
}

export async function rateLimit(
  request: NextRequest,
  endpoint: "login" | "register" | "resetPassword" | "default" = "default",
) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  const key = `${endpoint}:${ip}`
  const now = Date.now()

  // Get current rate limit data
  let rateLimitData = rateLimitStore.get(key)

  // If no data or window expired, create new entry
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitData = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW,
    }
    rateLimitStore.set(key, rateLimitData)
  }

  // Increment count
  rateLimitData.count++

  // Check if rate limit exceeded
  const maxRequests = MAX_REQUESTS[endpoint]
  if (rateLimitData.count > maxRequests) {
    // Log rate limit exceeded
    const userAgent = request.headers.get("user-agent") || ""

    await sql`
      INSERT INTO security_logs (event_type, ip_address, user_agent, details)
      VALUES ('rate_limit_exceeded', ${ip}, ${userAgent}, ${JSON.stringify({ endpoint })})
    `

    // Calculate retry-after in seconds
    const retryAfterSeconds = Math.ceil((rateLimitData.resetTime - now) / 1000)

    // Return rate limit response
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimitData.resetTime / 1000)),
        },
      },
    )
  }

  // Update store
  rateLimitStore.set(key, rateLimitData)

  // Continue with the request
  return null
}
