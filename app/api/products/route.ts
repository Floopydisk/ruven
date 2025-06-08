import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const vendorId = searchParams.get("vendorId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT p.*, v.business_name as vendor_name, v.logo_image as vendor_logo,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE 1=1
    `
    const params: any[] = []

    if (category) {
      query += ` AND p.category = $${params.length + 1}`
      params.push(category)
    }

    if (search) {
      query += ` AND (p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    if (vendorId) {
      query += ` AND p.vendor_id = $${params.length + 1}`
      params.push(Number.parseInt(vendorId))
    }

    query += ` GROUP BY p.id, v.business_name, v.logo_image ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const products = await sql.unsafe(query, params)

    return NextResponse.json({
      products: products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number.parseFloat(product.price),
        image: product.image,
        category: product.category,
        vendorId: product.vendor_id,
        vendorName: product.vendor_name,
        vendorLogo: product.vendor_logo,
        averageRating: Number.parseFloat(product.average_rating),
        reviewCount: Number.parseInt(product.review_count),
        createdAt: product.created_at,
      })),
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a vendor
    const vendors = await sql`SELECT id FROM vendors WHERE user_id = ${user.id}`
    if (vendors.length === 0) {
      return NextResponse.json({ error: "Only vendors can create products" }, { status: 403 })
    }

    const vendorId = vendors[0].id
    const { name, description, price, image, category, tags } = await request.json()

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO products (vendor_id, name, description, price, image, category, tags, created_at, updated_at)
      VALUES (${vendorId}, ${name}, ${description}, ${price}, ${image}, ${category}, ${JSON.stringify(tags || [])}, NOW(), NOW())
      RETURNING id
    `

    return NextResponse.json(
      {
        id: result[0].id,
        name,
        description,
        price: Number.parseFloat(price),
        image,
        category,
        tags,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
