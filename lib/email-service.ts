import nodemailer from "nodemailer"

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.example.com",
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

type EmailTemplate =
  | "new-login"
  | "password-changed"
  | "suspicious-activity"
  | "two-factor-enabled"
  | "two-factor-disabled"
  | "email-verification"
  | "password-reset"
  | "new-message"
  | "vendor-application-approved"
  | "vendor-application-rejected"

interface SendEmailParams {
  to: string
  template: EmailTemplate
  data: Record<string, any>
}

export async function sendEmail({ to, template, data }: SendEmailParams) {
  try {
    // Get template content based on template type
    const { subject, html } = getEmailTemplate(template, data)

    // Send email
    await transporter.sendMail({
      from: `"UniVendor" <${process.env.EMAIL_FROM || "noreply@univendor.com"}>`,
      to,
      subject,
      html,
    })

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

function getEmailTemplate(template: EmailTemplate, data: Record<string, any>) {
  switch (template) {
    case "new-login":
      return {
        subject: "New Login Detected - UniVendor",
        html: `
          <h1>New Login to Your Account</h1>
          <p>Hello ${data.name},</p>
          <p>We detected a new login to your account from a ${data.device} device using ${data.browser} in ${data.location}.</p>
          <p>Time: ${data.time}</p>
          <p>If this was you, you can ignore this email. If you didn't log in recently, please secure your account immediately by changing your password.</p>
          <a href="${data.resetPasswordUrl}" style="padding: 10px 15px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Thank you,<br>The UniVendor Team</p>
        `,
      }
    case "password-changed":
      return {
        subject: "Password Changed - UniVendor",
        html: `
          <h1>Your Password Has Been Changed</h1>
          <p>Hello ${data.name},</p>
          <p>Your password was recently changed on ${data.time}.</p>
          <p>If you made this change, you can ignore this email.</p>
          <p>If you didn't change your password, please contact support immediately.</p>
          <p>Thank you,<br>The UniVendor Team</p>
        `,
      }
    case "suspicious-activity":
      return {
        subject: "Suspicious Activity Detected - UniVendor",
        html: `
          <h1>Suspicious Activity Detected</h1>
          <p>Hello ${data.name},</p>
          <p>We've detected suspicious activity on your account:</p>
          <p>${data.activityDescription}</p>
          <p>Time: ${data.time}</p>
          <p>Location: ${data.location}</p>
          <p>If this was you, you can ignore this email. Otherwise, please secure your account immediately.</p>
          <a href="${data.securitySettingsUrl}" style="padding: 10px 15px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Review Security Settings</a>
          <p>Thank you,<br>The UniVendor Team</p>
        `,
      }
    // Add other email templates as needed
    default:
      return {
        subject: "Notification from UniVendor",
        html: `
          <h1>Notification</h1>
          <p>Hello ${data.name},</p>
          <p>${data.message}</p>
          <p>Thank you,<br>The UniVendor Team</p>
        `,
      }
  }
}
