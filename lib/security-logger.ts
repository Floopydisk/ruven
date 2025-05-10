import { neon } from "@neondatabase/serverless"

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
  | "admin_action"

interface SecurityLogData {
  userId?: number
  eventType: SecurityEventType
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
}

/**
 * Log a security event to the database
 */
async function logSecurityEvent({ userId, eventType, ipAddress, userAgent, details }: SecurityLogData): Promise<void> {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    await sql`
      INSERT INTO security_logs (
        user_id, 
        event_type, 
        ip_address, 
        user_agent, 
        details
      ) VALUES (
        ${userId || null}, 
        ${eventType}, 
        ${ipAddress || null}, 
        ${userAgent || null}, 
        ${details ? JSON.stringify(details) : null}
      )
    `

    // Send security notification for certain events
    if (
      eventType === "login_failed" ||
      eventType === "password_changed" ||
      eventType === "two_factor_disabled" ||
      eventType === "account_locked" ||
      eventType === "session_revoked"
    ) {
      await sendSecurityNotification(userId, eventType, ipAddress, details)
    }
  } catch (error) {
    console.error("Error logging security event:", error)
  }
}

/**
 * Send a security notification to the user
 */
async function sendSecurityNotification(
  userId: number | undefined,
  eventType: SecurityEventType,
  ipAddress?: string,
  details?: Record<string, any>,
): Promise<void> {
  if (!userId) return

  try {
    // Get user email
    const sql = neon(process.env.DATABASE_URL!)
    const userResult = await sql`
      SELECT email FROM users WHERE id = ${userId}
    `

    if (userResult.length === 0) return

    const userEmail = userResult[0].email
    const activityDescription = getActivityDescription(eventType)

    // In a real app, you would send an email here
    console.log(
      `Security notification for ${userEmail}: ${activityDescription} from ${ipAddress || "unknown location"}`,
    )

    // For now, just log to the console
  } catch (error) {
    console.error("Error sending security notification:", error)
  }
}

/**
 * Get a human-readable description of a security event
 */
function getActivityDescription(eventType: SecurityEventType): string {
  const descriptions: Record<SecurityEventType, string> = {
    login: "Successful login to your account",
    login_failed: "Failed login attempt to your account",
    logout: "Logout from your account",
    password_reset: "Password reset requested for your account",
    password_changed: "Password changed for your account",
    email_changed: "Email address changed for your account",
    profile_updated: "Profile information updated for your account",
    two_factor_enabled: "Two-factor authentication enabled for your account",
    two_factor_disabled: "Two-factor authentication disabled for your account",
    two_factor_challenge: "Two-factor authentication challenge completed",
    two_factor_challenge_failed: "Failed two-factor authentication challenge",
    account_locked: "Your account has been locked for security reasons",
    account_unlocked: "Your account has been unlocked",
    session_created: "New session created for your account",
    session_expired: "Session expired for your account",
    session_revoked: "Session manually revoked for your account",
    admin_action: "Administrative action performed on your account",
  }

  return descriptions[eventType] || "Security activity on your account"
}

/**
 * Parse user agent string to get browser and OS information
 */
function parseUserAgent(userAgent?: string): { browser: string; os: string } {
  if (!userAgent) {
    return { browser: "Unknown", os: "Unknown" }
  }

  // Simple parsing logic - in a real app, you would use a more robust solution
  let browser = "Unknown"
  let os = "Unknown"

  // Detect browser
  if (userAgent.includes("Firefox")) {
    browser = "Firefox"
  } else if (userAgent.includes("Chrome")) {
    browser = "Chrome"
  } else if (userAgent.includes("Safari")) {
    browser = "Safari"
  } else if (userAgent.includes("Edge")) {
    browser = "Edge"
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
    browser = "Internet Explorer"
  }

  // Detect OS
  if (userAgent.includes("Windows")) {
    os = "Windows"
  } else if (userAgent.includes("Mac OS")) {
    os = "macOS"
  } else if (userAgent.includes("Linux")) {
    os = "Linux"
  } else if (userAgent.includes("Android")) {
    os = "Android"
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS"
  }

  return { browser, os }
}

// Export the security logger
export const securityLogger = {
  log: logSecurityEvent,
}

export { logSecurityEvent, sendSecurityNotification, getActivityDescription, parseUserAgent }

export type { SecurityEventType, SecurityLogData }
