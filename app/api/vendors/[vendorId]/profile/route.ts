import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"
import { getVendorByUserId } from "@/lib/data"
import { securityLogger } from "@/lib/security-logger"

export async function PATCH(request: Request, { params }: { params: { vendorId: string } }) {
  try {
    const vendorId = Number.parseInt(params.vendorId)
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get vendor and verify ownership
    const vendor = await getVendorByUserId(user.id)

    if (!vendor || vendor.id !== vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { businessName, description, logoImage, bannerImage, location, businessHours, phone, website } = data

    // Update vendor profile
    await sql`
      UPDATE vendors 
      SET 
        business_name = COALESCE(${businessName}, business_name),
        description = COALESCE(${description}, description),
        logo_image = COALESCE(${logoImage}, logo_image),
        banner_image = COALESCE(${bannerImage}, banner_image),
        location = COALESCE(${location}, location),
        business_hours = COALESCE(${businessHours}, business_hours),
        phone = COALESCE(${phone}, phone),
        website = COALESCE(${website}, website),
        updated_at = NOW()
      WHERE id = ${vendorId}
    `

    // Log the vendor profile update
    await securityLogger.log({
      userId: user.id,
      eventType: "VENDOR_PROFILE_UPDATE",
      details: { vendorId, fields: Object.keys(data) },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    // Return updated vendor data
    return NextResponse.json({
      businessName: businessName || vendor.businessName,
      description: description || vendor.description,
      logoImage: logoImage || vendor.logoImage,
      bannerImage: bannerImage || vendor.bannerImage,
      location: location || vendor.location,
      businessHours: businessHours || vendor.businessHours,
      phone: phone || vendor.phone,
      website: website || vendor.website,
    })
  } catch (error) {
    console.error("Error updating vendor profile:", error)
    return NextResponse.json({ error: "Failed to update vendor profile" }, { status: 500 })
  }
}
