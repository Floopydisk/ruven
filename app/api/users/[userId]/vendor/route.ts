import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"
import { securityLogger } from "@/lib/security-logger"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)

    // Get vendor info for this user
    const vendors = await sql`
      SELECT * FROM vendors WHERE user_id = ${userId}
    `

    if (vendors.length === 0) {
      return NextResponse.json({ isVendor: false })
    }

    const vendor = vendors[0]

    return NextResponse.json({
      isVendor: true,
      vendor: {
        id: vendor.id,
        userId: vendor.user_id,
        businessName: vendor.business_name,
        description: vendor.description,
        logoImage: vendor.logo_image,
        bannerImage: vendor.banner_image,
        location: vendor.location,
        businessHours: vendor.business_hours,
        phone: vendor.phone,
        website: vendor.website,
        createdAt: vendor.created_at,
        updatedAt: vendor.updated_at,
      },
    })
  } catch (error) {
    console.error("Error checking vendor status:", error)
    return NextResponse.json({ error: "Failed to check vendor status" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)
    const currentUser = await getCurrentUser()

    // Ensure user is creating a vendor profile for themselves
    if (!currentUser || currentUser.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { businessName, description, logoImage, bannerImage, location, businessHours, phone, website } = data

    // Check if vendor already exists
    const existingVendors = await sql`
      SELECT * FROM vendors WHERE user_id = ${userId}
    `

    if (existingVendors.length > 0) {
      return NextResponse.json({ error: "Vendor profile already exists" }, { status: 400 })
    }

    // Create vendor profile
    const result = await sql`
      INSERT INTO vendors (
        user_id, 
        business_name, 
        description, 
        logo_image, 
        banner_image, 
        location, 
        business_hours, 
        phone, 
        website
      )
      VALUES (
        ${userId}, 
        ${businessName}, 
        ${description}, 
        ${logoImage}, 
        ${bannerImage}, 
        ${location}, 
        ${businessHours}, 
        ${phone}, 
        ${website}
      )
      RETURNING id
    `

    const vendorId = result[0].id

    // Log the vendor creation
    await securityLogger.log({
      userId: currentUser.id,
      eventType: "VENDOR_ACCOUNT_CREATED",
      details: { vendorId },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json(
      {
        id: vendorId,
        userId,
        businessName,
        description,
        logoImage,
        bannerImage,
        location,
        businessHours,
        phone,
        website,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating vendor profile:", error)
    return NextResponse.json({ error: "Failed to create vendor profile" }, { status: 500 })
  }
}
