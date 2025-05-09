import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Clock, Phone, Mail, ExternalLink, MessageSquare, Search } from "lucide-react"
import { getVendorById, getProductsByVendorId } from "@/lib/data"
import { NavBar } from "@/components/nav-bar"
import { notFound } from "next/navigation"

// Helper function to extract tags from description
function extractTags(description: string | null): string[] {
  if (!description) return []

  // Extract keywords from description
  const keywords = ["coffee", "tea", "print", "repair", "food", "tech", "healthy", "service", "academic"]
  return keywords.filter((keyword) => description?.toLowerCase().includes(keyword))
}

export default async function VendorPage({ params }: { params: { id: string } }) {
  const vendorId = Number.parseInt(params.id)

  // Fetch vendor data
  const vendor = await getVendorById(vendorId)

  if (!vendor) {
    notFound()
  }

  // Fetch vendor's products
  const products = await getProductsByVendorId(vendorId)

  return (
    <main className="flex min-h-screen flex-col pb-16 md:pb-0">
      <NavBar />

      <div className="relative h-48 md:h-64 w-full">
        <Image
          src={vendor.bannerImage || "/placeholder.svg?height=400&width=800"}
          alt={vendor.businessName}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 md:p-6 flex items-end">
          <div className="relative h-16 w-16 md:h-24 md:w-24 rounded-full overflow-hidden border-4 border-background">
            <Image
              src={vendor.logoImage || "/placeholder.svg?height=200&width=200"}
              alt={`${vendor.businessName} logo`}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-4 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{vendor.businessName}</h1>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">4.5</span>
              <span className="ml-1">(24 reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
            {extractTags(vendor.description).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Link href={`/messages/new?vendor=${vendor.id}`}>
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="about" className="mb-6">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="products">Products & Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="about" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">About {vendor.businessName}</h2>
                <p className="text-muted-foreground mb-6">{vendor.description}</p>

                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>{vendor.location || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>{vendor.businessHours || "Hours not specified"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>{vendor.phone || "Phone not specified"}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>Contact via messaging</span>
                  </div>
                  {vendor.website && (
                    <div className="flex items-center">
                      <ExternalLink className="h-5 w-5 mr-3 text-muted-foreground" />
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {vendor.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Location</h3>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Map placeholder</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{vendor.location || "Location not specified"}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Products & Services</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No products or services listed yet.</p>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="flex items-center mb-6">
              <div className="mr-4">
                <div className="text-3xl font-bold">4.5</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? "fill-primary text-primary" : i < 5 ? "fill-primary/50 text-primary/50" : "fill-muted text-muted"}`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">24 reviews</div>
              </div>
              <div className="flex-1">
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <span className="w-3 text-xs">{rating}</span>
                      <div className="ml-2 h-2 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 7 : rating === 2 ? 2 : 1}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">Login to see and write reviews.</p>
              <Link href="/auth/login">
                <Button>Log in to write a review</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-10 md:hidden">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center py-2 px-4">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center py-2 px-4">
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Browse</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-2 px-4">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="text-xs mt-1">Messages</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-2 px-4">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}
