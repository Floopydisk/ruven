import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"
import { getVendorByUserId } from "@/lib/data"

export async function GET(request: Request, { params }: { params: { vendorId: string } }) {
  try {
    const vendorId = Number.parseInt(params.vendorId)

    // Get products for this vendor
    const products = await sql`
      SELECT * FROM products 
      WHERE vendor_id = ${vendorId}
      ORDER BY name
    `

    return NextResponse.json({
      products: products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number.parseFloat(product.price),
        image: product.image,
      })),
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { vendorId: string } }) {
  try {
    const vendorId = Number.parseInt(params.vendorId)
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify vendor ownership
    const vendor = await getVendorByUserId(user.id)

    if (!vendor || vendor.id !== vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { name, description, price, image } = data

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    // Create new product
    const result = await sql`
      INSERT INTO products (vendor_id, name, description, price, image)
      VALUES (${vendorId}, ${name}, ${description}, ${price}, ${image})
      RETURNING id
    `

    const productId = result[0].id

    return NextResponse.json(
      {
        id: productId,
        name,
        description,
        price: Number.parseFloat(price),
        image,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
