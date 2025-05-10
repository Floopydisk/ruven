import crypto from "crypto"
import { sql } from "@/lib/db-direct"
import bcrypt from "bcryptjs"
import QRCode from "qrcode"
import speakeasy from "speakeasy"
import nodemailer from "nodemailer"

// Simple authentication functions without relying on external Stack Auth

export async function createStackUser(email: string, password: string) {
  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return { success: false, error: "User already exists" }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in our database
    const result = await sql`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (${email}, ${hashedPassword}, NOW())
      RETURNING id
    `

    return { success: true, userId: result[0].id }
  } catch (error) {
    console.error("User creation error:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function loginWithStack(email: string, password: string) {
  try {
    // Get user from database
    const users = await sql`
      SELECT id, email, password_hash FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0]

    // Verify the password
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return { success: false, error: "Invalid email or password" }
    }

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function verifyStackToken(token: string) {
  // Simple token verification
  try {
    // In a real implementation, we would verify the token with Stack Auth
    // For now, we'll just return success if the token exists
    return token ? { valid: true } : { valid: false }
  } catch (error) {
    console.error("Token verification error:", error)
    return { valid: false }
  }
}

export async function getStackUserInfo(userId: string) {
  try {
    // Get user from database
    const users = await sql`
      SELECT id, email, first_name, last_name, profile_image FROM users WHERE id = ${userId}
    `

    if (users.length === 0) {
      return null
    }

    return users[0]
  } catch (error) {
    console.error("Get user info error:", error)
    return null
  }
}

// Two-Factor Authentication Functions

export async function generateSecret() {
  const secret = speakeasy.generateSecret({
    name: "UniVendor",
    length: 20,
  })
  return secret.base32
}

export async function generateQRCode(email: string, secret: string) {
  const otpauth = speakeasy.otpauthURL({
    secret: secret,
    label: `UniVendor:${email}`,
    issuer: "UniVendor",
    encoding: "base32",
  })

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth)
    return qrCodeDataUrl
  } catch (error) {
    console.error("QR code generation error:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function verifyTOTP(secret: string, token: string) {
  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // Allow 1 step before and after for time drift
  })
  return verified
}

export async function generateBackupCodes() {
  const codes = []
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase()
    codes.push(code)
  }
  return codes
}

// Email Verification Functions

export function generateVerificationCode() {
  // Generate a 6-digit verification code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationEmail(email: string, code: string) {
  // Create a test account using Ethereal
  const testAccount = await nodemailer.createTestAccount()

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  // Send the email
  const info = await transporter.sendMail({
    from: '"UniVendor" <noreply@univendor.com>',
    to: email,
    subject: "Verify Your Email Address",
    text: `Your verification code is: ${code}. This code will expire in 1 hour.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Verify Your Email Address</h2>
        <p>Thank you for registering with UniVendor. Please use the following code to verify your email address:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${code}</span>
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this verification, you can safely ignore this email.</p>
        <p>Best regards,<br>The UniVendor Team</p>
      </div>
    `,
  })

  console.log("Verification email sent: %s", info.messageId)
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))

  return info
}

// Session Management Functions

export async function createSession(userId: number, userAgent: string, ipAddress: string) {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

  await sql`
    INSERT INTO sessions (user_id, token, expires_at, user_agent, ip_address, last_active)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()}, ${userAgent}, ${ipAddress}, NOW())
  `

  return { token, expiresAt }
}

export async function validateSession(token: string) {
  const sessions = await sql`
    SELECT s.*, u.id as user_id, u.email, u.first_name, u.last_name, u.profile_image
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `

  if (sessions.length === 0) {
    return null
  }

  // Update last active timestamp
  await sql`
    UPDATE sessions SET last_active = NOW() WHERE token = ${token}
  `

  return {
    session: sessions[0],
    user: {
      id: sessions[0].user_id,
      email: sessions[0].email,
      firstName: sessions[0].first_name,
      lastName: sessions[0].last_name,
      profileImage: sessions[0].profile_image,
    },
  }
}

export async function deleteSession(token: string) {
  await sql`DELETE FROM sessions WHERE token = ${token}`
}

export async function deleteAllUserSessions(userId: number, exceptToken?: string) {
  if (exceptToken) {
    await sql`DELETE FROM sessions WHERE user_id = ${userId} AND token != ${exceptToken}`
  } else {
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`
  }
}
