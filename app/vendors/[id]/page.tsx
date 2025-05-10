import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VendorProfileHeader } from "@/components/vendor-profile-header"
import { NavBar } from "@/components/nav-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { MessageSquare, Star, Clock, MapPin } from "lucide-react"

export const dynamic = "force-dynamic"

async function getVendorData(vendorId: number) {
  const sql = neon(process.env.DATABASE_URL!)

  // Get vendor details
  const vendorResult = await sql`
    SELECT 
      v.id, 
      v.business_name, 
      v.description, 
      v.location, 
      v.website, 
      v.phone, 
      v.logo_image, 
      v.banner_image,
      v.business_hours,
      v.user_id
    FROM vendors v
    WHERE v.id = ${vendorId}
  `

  if (vendorResult.length === 0) {
    return null
  }

  const vendor = {
    id: vendorResult[0].id,
    businessName: vendorResult[0].business_name,
    description: vendorResult[0].description,
    location: vendorResult[0].location,
    website: vendorResult[0].website,
    phone: vendorResult[0].phone,
    logoImage: vendorResult[0].logo_image,
    bannerImage: vendorResult[0].banner_image,
    businessHours: vendorResult[0].business_hours,
    userId: vendorResult[0].user_id,
  }

  // Get vendor products
  const productsResult = await sql`
    SELECT id, name, description, price, image
    FROM products
    WHERE vendor_id = ${vendorId}
    ORDER BY id DESC
  `

  const products = productsResult.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
  }))

  // Get vendor reviews (placeholder for now)
  const reviews = [
    {
      id: 1,
      userName: "John Doe",
      rating: 5,
      comment: "Great service and products!",
      date: "2023-05-15",
    },
    {
      id: 2,
      userName: "Jane Smith",
      rating: 4,
      comment: "Good quality, but a bit pricey.",
      date: "2023-05-10",
    },
    {
      id: 3,
      userName: "Mike Johnson",
      rating: 5,
      comment: "Excellent customer service!",
      date: "2023-05-05",
    },
  ]

  return {
    vendor,
    products,
    reviews,
  }
}

export default async function VendorPage({ params }: { params: { id: string } }) {
  const vendorId = Number.parseInt(params.id)
  if (isNaN(vendorId)) {
    redirect("/browse")
  }

  const data = await getVendorData(vendorId)
  if (!data) {
    redirect("/browse")
  }

  const { vendor, products, reviews } = data

  // Get current user to check if they are the vendor owner
  const currentUser = await getCurrentUser()
  const isOwner = currentUser?.id === vendor.userId

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <NavBar />

      <VendorProfileHeader vendor={vendor} isOwner={isOwner} />

      <main className="container px-4 py-6">
        <Tabs defaultValue="products" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products & Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No products or services listed yet</h3>
                <p className="text-muted-foreground mb-6">This vendor hasn't added any products or services yet.</p>
                {isOwner && (
                  <Link href="/dashboard/vendor/products">
                    <Button>Add Products</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id}>
                    <div className="aspect-video relative">
                      <Image
                        src={product.image || "/placeholder.svg?height=200&width=400"}
                        alt={product.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                      {!isOwner && (
                        <Link href={`/messages/new?vendorId=${vendor.id}&product=${product.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Inquire
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Customer Reviews</CardTitle>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">4.7</span>
                    <span className="text-muted-foreground ml-1">({reviews.length} reviews)</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{review.userName}</div>
                          <div className="text-sm text-muted-foreground">{review.date}</div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-muted text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vendor.location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-muted-foreground">{vendor.location}</div>
                      </div>
                    </div>
                  )}

                  {vendor.businessHours && (
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Business Hours</div>
                        <div className="text-sm text-muted-foreground">{vendor.businessHours}</div>
                      </div>
                    </div>
                  )}

                  {vendor.phone && (
                    <div className="flex items-start">
                      <div className="h-5 w-5 mr-2 mt-0.5 flex items-center justify-center text-muted-foreground">
                        📞
                      </div>
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-sm text-muted-foreground">{vendor.phone}</div>
                      </div>
                    </div>
                  )}

                  {vendor.website && (
                    <div className="flex items-start">
                      <div className="h-5 w-5 mr-2 mt-0.5 flex items-center justify-center text-muted-foreground">
                        🌐
                      </div>
                      <div>
                        <div className="font-medium">Website</div>
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          {vendor.website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About {vendor.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {vendor.description ? (
                    <p className="text-sm">{vendor.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No description provided.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  )
}
