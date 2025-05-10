import { sql } from "@/lib/db-direct"
import bcrypt from "bcryptjs"
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
