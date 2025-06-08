import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a vendor
    const vendors = await sql`
      SELECT * FROM vendors WHERE user_id = ${user.id}
    `

    return NextResponse.json({
      isVendor: vendors.length > 0,
      vendor:
        vendors.length > 0
          ? {
              id: vendors[0].id,
              businessName: vendors[0].business_name,
              description: vendors[0].description,
              logoImage: vendors[0].logo_image,
              bannerImage: vendors[0].banner_image,
              location: vendors[0].location,
              businessHours: vendors[0].business_hours,
              phone: vendors[0].phone,
              website: vendors[0].website,
            }
          : null,
    })
  } catch (error) {
    console.error("Error checking vendor status:", error)
    return NextResponse.json({ error: "Failed to check vendor status" }, { status: 500 })
  }
}
