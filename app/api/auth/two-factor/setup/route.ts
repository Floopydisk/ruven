import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"
import { generateSecret, generateQRCode } from "@/lib/stack-auth"

export async function POST() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate a new TOTP secret
    const secret = await generateSecret()

    // Generate a QR code for the secret
    const qrCode = await generateQRCode(user.email, secret)

    // Store the secret temporarily (not enabled yet until verified)
    await sql`
      UPDATE users 
      SET two_factor_secret = ${secret}, two_factor_enabled = false 
      WHERE id = ${user.id}
    `

    return NextResponse.json({ secret, qrCode })
  } catch (error) {
    console.error("Error setting up 2FA:", error)
    return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 })
  }
}
