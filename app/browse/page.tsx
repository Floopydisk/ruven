import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Star, ChevronDown, Utensils, Laptop, Briefcase } from "lucide-react"
import { getAllVendors } from "@/lib/data"
import { NavBar } from "@/components/nav-bar"

// Helper function to extract tags from description
function extractTags(description: string | null): string[] {
  if (!description) return []

  // Extract keywords from description
  const keywords = ["coffee", "tea", "print", "repair", "food", "tech", "healthy", "service", "academic"]
  return keywords.filter((keyword) => description.toLowerCase().includes(keyword))
}

export default async function BrowsePage() {
  // Fetch vendors from database
  const vendors = await getAllVendors()

  // Group vendors by category
  const foodVendors = vendors.filter(
    (v) =>
      v.description?.toLowerCase().includes("food") ||
      v.description?.toLowerCase().includes("coffee") ||
      v.description?.toLowerCase().includes("eat"),
  )

  const serviceVendors = vendors.filter(
    (v) => v.description?.toLowerCase().includes("service") || v.description?.toLowerCase().includes("print"),
  )

  const techVendors = vendors.filter(
    (v) => v.description?.toLowerCase().includes("tech") || v.description?.toLowerCase().includes("repair"),
  )

  return (
    <main className="flex min-h-screen flex-col pb-16 md:pb-0">
      <NavBar />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Browse Vendors</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="md:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search vendors..." className="pl-8" />
            </div>
          </div>
        </div>

        <div className="relative md:flex gap-6">
          {/* Sidebar */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-20 space-y-6 pr-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Categories</h3>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-primary">
                    Reset
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="food" />
                    <label htmlFor="food" className="text-sm flex items-center cursor-pointer">
                      <Utensils className="h-4 w-4 mr-2 text-primary" />
                      Food & Beverage
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="services" />
                    <label htmlFor="services" className="text-sm flex items-center cursor-pointer">
                      <Briefcase className="h-4 w-4 mr-2 text-primary" />
                      Services
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="tech" />
                    <label htmlFor="tech" className="text-sm flex items-center cursor-pointer">
                      <Laptop className="h-4 w-4 mr-2 text-primary" />
                      Tech
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Price Range</h3>
                </div>
                <div className="px-2">
                  <Slider defaultValue={[0, 100]} max={100} step={1} />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>$0</span>
                    <span>$100+</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Rating</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="rating-5" />
                    <label htmlFor="rating-5" className="text-sm flex items-center cursor-pointer">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="rating-4" />
                    <label htmlFor="rating-4" className="text-sm flex items-center cursor-pointer">
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="rating-3" />
                    <label htmlFor="rating-3" className="text-sm flex items-center cursor-pointer">
                      <div className="flex">
                        {[...Array(3)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                        {[...Array(2)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-muted-foreground" />
                        ))}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Location</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="location-1" />
                    <label htmlFor="location-1" className="text-sm cursor-pointer">
                      Student Union
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="location-2" />
                    <label htmlFor="location-2" className="text-sm cursor-pointer">
                      Library
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="location-3" />
                    <label htmlFor="location-3" className="text-sm cursor-pointer">
                      Main Campus
                    </label>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="md:hidden relative mb-6">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search vendors or products..." className="pl-8" />
            </div>

            <div className="flex items-center justify-between mb-6">
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList className="bg-secondary/50 p-1">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="food"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Food
                    </TabsTrigger>
                    <TabsTrigger
                      value="services"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Services
                    </TabsTrigger>
                    <TabsTrigger
                      value="tech"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Tech
                    </TabsTrigger>
                  </TabsList>

                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      Popularity <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <TabsContent value="all" className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor) => (
                      <Card
                        key={vendor.id}
                        className="overflow-hidden bg-secondary/30 border-primary/10 hover:border-primary/30 transition-colors group"
                      >
                        <div className="aspect-video relative">
                          <Image
                            src={vendor.logoImage || "/placeholder.svg"}
                            alt={vendor.businessName}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium text-white">4.5</span>
                            <span className="text-xs text-white/80 ml-1">(24)</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{vendor.location || "On Campus"}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {extractTags(vendor.description).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {vendor.description || "No description available"}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex gap-2">
                          <Link href={`/vendors/${vendor.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                            >
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/messages/new?vendor=${vendor.id}`} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                              Message
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="food" className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foodVendors.map((vendor) => (
                      <Card
                        key={vendor.id}
                        className="overflow-hidden bg-secondary/30 border-primary/10 hover:border-primary/30 transition-colors group"
                      >
                        <div className="aspect-video relative">
                          <Image
                            src={vendor.logoImage || "/placeholder.svg"}
                            alt={vendor.businessName}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium text-white">4.5</span>
                            <span className="text-xs text-white/80 ml-1">(24)</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{vendor.location || "On Campus"}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {extractTags(vendor.description).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {vendor.description || "No description available"}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex gap-2">
                          <Link href={`/vendors/${vendor.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                            >
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/messages/new?vendor=${vendor.id}`} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                              Message
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="services">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviceVendors.map((vendor) => (
                      <Card
                        key={vendor.id}
                        className="overflow-hidden bg-secondary/30 border-primary/10 hover:border-primary/30 transition-colors group"
                      >
                        <div className="aspect-video relative">
                          <Image
                            src={vendor.logoImage || "/placeholder.svg"}
                            alt={vendor.businessName}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium text-white">4.5</span>
                            <span className="text-xs text-white/80 ml-1">(24)</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{vendor.location || "On Campus"}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {extractTags(vendor.description).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {vendor.description || "No description available"}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex gap-2">
                          <Link href={`/vendors/${vendor.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                            >
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/messages/new?vendor=${vendor.id}`} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                              Message
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tech">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {techVendors.map((vendor) => (
                      <Card
                        key={vendor.id}
                        className="overflow-hidden bg-secondary/30 border-primary/10 hover:border-primary/30 transition-colors group"
                      >
                        <div className="aspect-video relative">
                          <Image
                            src={vendor.logoImage || "/placeholder.svg"}
                            alt={vendor.businessName}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium text-white">4.5</span>
                            <span className="text-xs text-white/80 ml-1">(24)</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{vendor.location || "On Campus"}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {extractTags(vendor.description).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {vendor.description || "No description available"}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex gap-2">
                          <Link href={`/vendors/${vendor.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                            >
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/messages/new?vendor=${vendor.id}`} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                              Message
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md z-10 md:hidden">
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
            <Search className="h-5 w-5 text-primary" />
            <span className="text-xs mt-1 text-primary">Browse</span>
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
