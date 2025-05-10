import { NextResponse } from "next/server"
import { sql } from "@/lib/db-direct"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Get filter parameters
    const category = searchParams.get("category")
    const minRating = searchParams.get("minRating")
    const location = searchParams.get("location")
    const searchQuery = searchParams.get("q")

    // Build the query
    let query = `
      SELECT 
        v.*,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as review_count
      FROM 
        vendors v
      LEFT JOIN 
        ratings r ON v.id = r.vendor_id
    `

    // Add WHERE clauses
    const whereConditions = []
    const queryParams = []

    if (searchQuery) {
      whereConditions.push(
        `(v.business_name ILIKE $${queryParams.length + 1} OR v.description ILIKE $${queryParams.length + 1})`,
      )
      queryParams.push(`%${searchQuery}%`)
    }

    if (category) {
      whereConditions.push(`v.categories && $${queryParams.length + 1}`)
      queryParams.push(`{${category}}`)
    }

    if (location) {
      whereConditions.push(`v.location ILIKE $${queryParams.length + 1}`)
      queryParams.push(`%${location}%`)
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    // Group by and order
    query += `
      GROUP BY v.id
    `

    if (minRating) {
      query += ` HAVING COALESCE(AVG(r.rating), 0) >= $${queryParams.length + 1}`
      queryParams.push(Number.parseFloat(minRating))
    }

    query += ` ORDER BY v.business_name`

    // Execute the query
    const result = await sql.raw(query, queryParams)

    // Format the result
    const vendors = result.rows.map((vendor) => ({
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
      categories: vendor.categories || [],
      rating: Number.parseFloat(vendor.avg_rating) || 0,
      reviewCount: Number.parseInt(vendor.review_count) || 0,
    }))

    return NextResponse.json(vendors)
  } catch (error) {
    console.error("Error filtering vendors:", error)
    return NextResponse.json({ error: "Failed to filter vendors" }, { status: 500 })
  }
}
