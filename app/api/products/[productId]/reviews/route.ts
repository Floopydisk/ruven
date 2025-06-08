import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db-direct"

export async function GET(request: Request, { params }: { params: { productId: string } }) {
  try {
    const productId = Number.parseInt(params.productId)

    const reviews = await sql`
      SELECT r.*, u.first_name, u.last_name, u.profile_image
      FROM product_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ${productId}
      ORDER BY r.created_at DESC
    `

    return NextResponse.json({
      reviews: reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        user: {
          name: `${review.first_name} ${review.last_name}`,
          image: review.profile_image,
        },
      })),
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { productId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productId = Number.parseInt(params.productId)
    const { rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Check if user already reviewed this product
    const existingReview = await sql`
      SELECT id FROM product_reviews WHERE user_id = ${user.id} AND product_id = ${productId}
    `

    if (existingReview.length > 0) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO product_reviews (user_id, product_id, rating, comment, created_at)
      VALUES (${user.id}, ${productId}, ${rating}, ${comment}, NOW())
      RETURNING id
    `

    return NextResponse.json(
      {
        id: result[0].id,
        rating,
        comment,
        createdAt: new Date(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
