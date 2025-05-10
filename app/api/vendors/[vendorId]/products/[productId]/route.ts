import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"
import { getVendorByUserId } from "@/lib/data"

export async function GET(request: Request, { params }: { params: { vendorId: string; productId: string } }) {
  try {
    const vendorId = Number.parseInt(params.vendorId)
    const productId = Number.parseInt(params.productId)

    // Get specific product
    const products = await sql`
      SELECT * FROM products 
      WHERE id = ${productId} AND vendor_id = ${vendorId}
    `

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = products[0]

    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number.parseFloat(product.price),
      image: product.image,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { vendorId: string; productId: string } }) {
  try {
    const vendorId = Number.parseInt(params.vendorId)
    const productId = Number.parseInt(params.productId)
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify vendor ownership
    const vendor = await getVendorByUserId(user.id)

    if (!vendor || vendor.id !== vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify product exists and belongs to vendor
    const existingProducts = await sql`
      SELECT * FROM products 
      WHERE id = ${productId} AND vendor_id = ${vendorId}
    `

    if (existingProducts.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const data = await request.json()
    const { name, description, price, image } = data

    // Update product
    await sql`
      UPDATE products 
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        price = COALESCE(${price}, price),
        image = COALESCE(${image}, image),
        updated_at = NOW()
      WHERE id = ${productId} AND vendor_id = ${vendorId}
    `

    // Get updated product
    const updatedProducts = await sql`
      SELECT * FROM products 
      WHERE id = ${productId}
    `

    const updatedProduct = updatedProducts[0]

    return NextResponse.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: Number.parseFloat(updatedProduct.price),
      image: updatedProduct.image,
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { vendorId: string; productId: string } }) {
  try {
    const vendorId = Number.parseInt(params.vendorId)
    const productId = Number.parseInt(params.productId)
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify vendor ownership
    const vendor = await getVendorByUserId(user.id)

    if (!vendor || vendor.id !== vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify product exists and belongs to vendor
    const existingProducts = await sql`
      SELECT * FROM products 
      WHERE id = ${productId} AND vendor_id = ${vendorId}
    `

    if (existingProducts.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product
    await sql`
      DELETE FROM products 
      WHERE id = ${productId} AND vendor_id = ${vendorId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
