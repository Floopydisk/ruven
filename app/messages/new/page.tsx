import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/nav-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { NewMessageForm } from "@/components/new-message-form"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

async function getVendorData(vendorId: number) {
  const sql = neon(process.env.DATABASE_URL!)

  // Get vendor details
  const vendorResult = await sql`
    SELECT 
      v.id, 
      v.business_name, 
      v.logo_image
    FROM vendors v
    WHERE v.id = ${vendorId}
  `

  if (vendorResult.length === 0) {
    return null
  }

  const vendor = {
    id: vendorResult[0].id,
    businessName: vendorResult[0].business_name,
    logoImage: vendorResult[0].logo_image,
  }

  // Get product details if provided
  let product = null
  if (vendorId) {
    const productResult = await sql`
      SELECT id, name, price
      FROM products
      WHERE vendor_id = ${vendorId}
      LIMIT 5
    `

    if (productResult.length > 0) {
      product = productResult.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
      }))
    }
  }

  return {
    vendor,
    products: product,
  }
}

export default async function NewMessagePage({
  searchParams,
}: {
  searchParams: { vendorId?: string; product?: string }
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const vendorId = searchParams.vendorId ? Number.parseInt(searchParams.vendorId) : null
  const productId = searchParams.product ? Number.parseInt(searchParams.product) : null

  let vendorData = null
  if (vendorId) {
    vendorData = await getVendorData(vendorId)
    if (!vendorData) {
      redirect("/browse")
    }
  }

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <NavBar />

      <div className="container px-4 py-6 flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          <Link href={vendorId ? `/vendors/${vendorId}` : "/messages"} className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          {vendorData && (
            <div className="flex items-center">
              <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                <Image
                  src={vendorData.vendor.logoImage || "/placeholder.svg?height=40&width=40"}
                  alt={vendorData.vendor.businessName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="font-semibold">{vendorData.vendor.businessName}</h1>
                <p className="text-xs text-muted-foreground">Vendor</p>
              </div>
            </div>
          )}
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-base">New Message</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <NewMessageForm
              vendorId={vendorId}
              vendorName={vendorData?.vendor.businessName}
              productId={productId}
              products={vendorData?.products}
            />
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  )
}
