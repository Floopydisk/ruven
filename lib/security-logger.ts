import { neon } from "@neondatabase/serverless"
import { UAParser } from "ua-parser-js"

type SecurityEventType =
  | "login"
  | "login_failed"
  | "logout"
  | "password_reset"
  | "password_changed"
  | "email_changed"
  | "profile_updated"
  | "two_factor_enabled"
  | "two_factor_disabled"
  | "two_factor_challenge"
  | "two_factor_challenge_failed"
  | "account_locked"
  | "account_unlocked"
  | "session_created"
  | "session_expired"
  | "session_revoked"

interface SecurityEventDetails {
  userId?: number
  email?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  details?: Record<string, any>
}

/**
 * Logs a security event to the database
 */
export async function logSecurityEvent(eventType: SecurityEventType, details?: SecurityEventDetails) {
  try {
    // Handle the case where details might be undefined
    if (!details) {
      details = {}
    }

    // Create a new SQL client for each request to avoid connection issues
    const sql = neon(process.env.DATABASE_URL!)

    // Extract details with safe defaults
    const userId = details.userId || null
    const ipAddress = details.ipAddress || null
    const userAgent = details.userAgent || null
    const eventDetails = details.details || null

    // Parse user agent
    const deviceInfo = userAgent ? parseUserAgent(userAgent) : null

    // Log to database with better error handling
    try {
      await sql`
        INSERT INTO security_logs (
          event_type, 
          user_id, 
          ip_address, 
          user_agent, 
          details
        ) VALUES (
          ${eventType}, 
          ${userId}, 
          ${ipAddress}, 
          ${userAgent}, 
          ${eventDetails ? JSON.stringify(eventDetails) : null}
        )
      `
    } catch (dbError) {
      // Log the error but don't throw it to prevent breaking the login flow
      console.error("Database error when logging security event:", dbError)
      // Continue execution - don't block the main flow for logging failures
    }

    // Send notification for important security events
    if (
      eventType === "login_failed" ||
      eventType === "password_changed" ||
      eventType === "two_factor_enabled" ||
      eventType === "two_factor_disabled" ||
      eventType === "account_locked" ||
      eventType === "session_revoked"
    ) {
      try {
        await sendSecurityNotification(eventType, details, deviceInfo)
      } catch (notificationError) {
        console.error("Error sending security notification:", notificationError)
        // Continue execution - don't block the main flow for notification failures
      }
    }

    return true
  } catch (error) {
    // Log the error but don't throw it to prevent breaking the login flow
    console.error("Error logging security event:", error)
    return false
  }
}

/**
 * Sends a security notification for important events
 */
async function sendSecurityNotification(eventType: SecurityEventType, details: SecurityEventDetails, deviceInfo: any) {
  // In a real app, this would send an email or push notification
  // For now, we'll just log to console
  console.log(`SECURITY NOTIFICATION: ${eventType}`)
  console.log(`User: ${details.email || details.userId || "Unknown"}`)
  console.log(`IP Address: ${details.ipAddress || "Unknown"}`)
  console.log(`Device: ${deviceInfo?.device?.vendor || "Unknown"} ${deviceInfo?.device?.model || "Unknown"}`)
  console.log(`Browser: ${deviceInfo?.browser?.name || "Unknown"} ${deviceInfo?.browser?.version || "Unknown"}`)
  console.log(`OS: ${deviceInfo?.os?.name || "Unknown"} ${deviceInfo?.os?.version || "Unknown"}`)
  console.log(`Activity: ${getActivityDescription(eventType)}`)
  console.log(`Time: ${new Date().toISOString()}`)
}

/**
 * Gets a human-readable description of the security event
 */
function getActivityDescription(eventType: SecurityEventType): string {
  const descriptions: Record<SecurityEventType, string> = {
    login: "Successful login to your account",
    login_failed: "Failed login attempt to your account",
    logout: "Logout from your account",
    password_reset: "Password reset requested",
    password_changed: "Password was changed",
    email_changed: "Email address was changed",
    profile_updated: "Profile information was updated",
    two_factor_enabled: "Two-factor authentication was enabled",
    two_factor_disabled: "Two-factor authentication was disabled",
    two_factor_challenge: "Two-factor authentication challenge completed",
    two_factor_challenge_failed: "Failed two-factor authentication attempt",
    account_locked: "Account was locked due to suspicious activity",
    account_unlocked: "Account was unlocked",
    session_created: "New session created",
    session_expired: "Session expired",
    session_revoked: "Session was manually revoked",
  }

  return descriptions[eventType] || "Unknown security activity"
}

/**
 * Parses user agent string to get device information
 */
function parseUserAgent(userAgent: string) {
  try {
    const parser = new UAParser(userAgent)
    return {
      browser: parser.getBrowser(),
      device: parser.getDevice(),
      os: parser.getOS(),
    }
  } catch (error) {
    console.error("Error parsing user agent:", error)
    return {
      browser: { name: "Unknown", version: "Unknown" },
      device: { vendor: "Unknown", model: "Unknown" },
      os: { name: "Unknown", version: "Unknown" },
    }
  }
}

// Export the security logger as an object with a log method
export const securityLogger = {
  log: logSecurityEvent,
}

// Also export individual functions for direct use
export { sendSecurityNotification, getActivityDescription, parseUserAgent }
