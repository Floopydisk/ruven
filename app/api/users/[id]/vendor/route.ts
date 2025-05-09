import { NextResponse } from "next/server"
import { getVendorForUser } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    const vendor = await getVendorForUser(userId)

    return NextResponse.json({ vendor })
  } catch (error) {
    console.error("Error fetching vendor:", error)
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 })
  }
}
