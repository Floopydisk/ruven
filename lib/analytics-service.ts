import { sql } from "@/lib/db-direct"

export async function getUserAnalytics() {
  try {
    // Get total users count
    const totalUsersResult = await sql`SELECT COUNT(*) as count FROM users`
    const totalUsers = Number.parseInt(totalUsersResult[0]?.count || "0")

    // Get new users in the last 30 days
    const newUsersResult = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at > NOW() - INTERVAL '30 days'
    `
    const newUsers = Number.parseInt(newUsersResult[0]?.count || "0")

    // Get users by role
    const usersByRoleResult = await sql`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `

    // Get verified vs unverified users
    const verifiedUsersResult = await sql`
      SELECT 
        SUM(CASE WHEN email_verified = true THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN email_verified = false OR email_verified IS NULL THEN 1 ELSE 0 END) as unverified
      FROM users
    `

    // Get users with 2FA enabled
    const twoFactorUsersResult = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE two_factor_enabled = true
    `
    const twoFactorUsers = Number.parseInt(twoFactorUsersResult[0]?.count || "0")

    // Get user registration over time (last 12 months)
    const userGrowthResult = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM users
      WHERE created_at > NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `

    return {
      totalUsers,
      newUsers,
      usersByRole: usersByRoleResult,
      verifiedUsers: Number.parseInt(verifiedUsersResult[0]?.verified || "0"),
      unverifiedUsers: Number.parseInt(verifiedUsersResult[0]?.unverified || "0"),
      twoFactorUsers,
      userGrowth: userGrowthResult,
    }
  } catch (error) {
    console.error("Error fetching user analytics:", error)
    return null
  }
}

export async function getSecurityAnalytics() {
  try {
    // Get login attempts in the last 30 days
    const loginAttemptsResult = await sql`
      SELECT COUNT(*) as count 
      FROM security_logs 
      WHERE event_type = 'login_attempt'
      AND created_at > NOW() - INTERVAL '30 days'
    `
    const loginAttempts = Number.parseInt(loginAttemptsResult[0]?.count || "0")

    // Get failed logins in the last 30 days
    const failedLoginsResult = await sql`
      SELECT COUNT(*) as count 
      FROM security_logs 
      WHERE event_type = 'login_failed'
      AND created_at > NOW() - INTERVAL '30 days'
    `
    const failedLogins = Number.parseInt(failedLoginsResult[0]?.count || "0")

    // Get rate limit exceeded events in the last 30 days
    const rateLimitResult = await sql`
      SELECT COUNT(*) as count 
      FROM security_logs 
      WHERE event_type = 'rate_limit_exceeded'
      AND created_at > NOW() - INTERVAL '30 days'
    `
    const rateLimitExceeded = Number.parseInt(rateLimitResult[0]?.count || "0")

    // Get security events by type in the last 30 days
    const eventsByTypeResult = await sql`
      SELECT event_type, COUNT(*) as count 
      FROM security_logs 
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY event_type
      ORDER BY count DESC
    `

    // Get security events by country
    const eventsByCountryResult = await sql`
      SELECT 
        COALESCE(details->>'country', 'Unknown') as country,
        COUNT(*) as count
      FROM security_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `

    // Get security events over time (last 30 days)
    const eventsOverTimeResult = await sql`
      SELECT 
        DATE_TRUNC('day', created_at) as day,
        COUNT(*) as count
      FROM security_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day
    `

    return {
      loginAttempts,
      failedLogins,
      rateLimitExceeded,
      securityRisk: calculateSecurityRisk(failedLogins, loginAttempts, rateLimitExceeded),
      eventsByType: eventsByTypeResult,
      eventsByCountry: eventsByCountryResult,
      eventsOverTime: eventsOverTimeResult,
    }
  } catch (error) {
    console.error("Error fetching security analytics:", error)
    return null
  }
}

export async function getMessageAnalytics() {
  try {
    // Get total messages count
    const totalMessagesResult = await sql`SELECT COUNT(*) as count FROM messages`
    const totalMessages = Number.parseInt(totalMessagesResult[0]?.count || "0")

    // Get messages in the last 30 days
    const recentMessagesResult = await sql`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE created_at > NOW() - INTERVAL '30 days'
    `
    const recentMessages = Number.parseInt(recentMessagesResult[0]?.count || "0")

    // Get total conversations count
    const totalConversationsResult = await sql`SELECT COUNT(*) as count FROM conversations`
    const totalConversations = Number.parseInt(totalConversationsResult[0]?.count || "0")

    // Get active conversations (with messages in the last 7 days)
    const activeConversationsResult = await sql`
      SELECT COUNT(DISTINCT conversation_id) as count 
      FROM messages 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `
    const activeConversations = Number.parseInt(activeConversationsResult[0]?.count || "0")

    // Get messages per day (last 30 days)
    const messagesPerDayResult = await sql`
      SELECT 
        DATE_TRUNC('day', created_at) as day,
        COUNT(*) as count
      FROM messages
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day
    `

    // Get top 5 most active vendors by message count
    const topVendorsResult = await sql`
      SELECT 
        v.id as vendor_id,
        v.business_name,
        COUNT(m.id) as message_count
      FROM vendors v
      JOIN conversations c ON v.id = c.vendor_id
      JOIN messages m ON c.id = m.conversation_id
      WHERE m.created_at > NOW() - INTERVAL '30 days'
      GROUP BY v.id, v.business_name
      ORDER BY message_count DESC
      LIMIT 5
    `

    return {
      totalMessages,
      recentMessages,
      totalConversations,
      activeConversations,
      messagesPerDay: messagesPerDayResult,
      topVendors: topVendorsResult,
      averageResponseTime: await calculateAverageResponseTime(),
    }
  } catch (error) {
    console.error("Error fetching message analytics:", error)
    return null
  }
}

async function calculateAverageResponseTime() {
  try {
    // This is a complex query to calculate average response time
    // It finds pairs of messages in the same conversation with different senders
    // and calculates the time difference
    const result = await sql`
      WITH message_pairs AS (
        SELECT
          m1.conversation_id,
          m1.created_at as first_message_time,
          MIN(m2.created_at) as response_time
        FROM messages m1
        JOIN messages m2 ON 
          m1.conversation_id = m2.conversation_id AND
          m1.sender_id != m2.sender_id AND
          m2.created_at > m1.created_at
        WHERE m1.created_at > NOW() - INTERVAL '30 days'
        GROUP BY m1.id, m1.conversation_id, m1.created_at
      )
      SELECT 
        AVG(EXTRACT(EPOCH FROM (response_time - first_message_time))) as avg_response_time_seconds
      FROM message_pairs
    `

    const avgSeconds = Number.parseFloat(result[0]?.avg_response_time_seconds || "0")

    // Convert to minutes for easier reading
    return Math.round(avgSeconds / 60)
  } catch (error) {
    console.error("Error calculating average response time:", error)
    return 0
  }
}

function calculateSecurityRisk(failedLogins: number, totalLogins: number, rateLimitEvents: number): string {
  // Simple algorithm to determine security risk
  const failureRate = totalLogins > 0 ? failedLogins / totalLogins : 0

  if (rateLimitEvents > 10 || failureRate > 0.3) {
    return "High"
  } else if (rateLimitEvents > 5 || failureRate > 0.15) {
    return "Medium"
  } else {
    return "Low"
  }
}
