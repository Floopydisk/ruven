import { NextResponse } from "next/server"
import { sql } from "@/lib/db-direct"

export async function POST(request: Request) {
  try {
    const { userId, businessName } = await request.json()

    if (!userId || !businessName) {
      return NextResponse.json({ error: "User ID and business name are required" }, { status: 400 })
    }

    // Check if vendor already exists
    const existingVendors = await sql`SELECT * FROM vendors WHERE user_id = ${userId}`

    if (existingVendors.length > 0) {
      return NextResponse.json({ error: "Vendor already exists for this user" }, { status: 400 })
    }

    // Create vendor
    const vendor = await sql`
      INSERT INTO vendors (user_id, business_name, created_at, updated_at) 
      VALUES (${userId}, ${businessName}, NOW(), NOW()) 
      RETURNING *
    `

    return NextResponse.json({ vendor: vendor[0] })
  } catch (error) {
    console.error("Error creating vendor:", error)
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 })
  }
}
