import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Clock, Coffee, Wrench, Utensils } from "lucide-react"
import { getAllVendors } from "@/lib/data"
import { BottomNavigation } from "@/components/bottom-navigation"
import { NavBar } from "@/components/nav-bar"
import { VendorCard } from "@/components/vendor-card"

// Helper function to extract tags from description
function extractTags(description: string | null): string[] {
  if (!description) return []

  // Extract keywords from description
  const keywords = ["coffee", "tea", "print", "repair", "food", "tech", "healthy", "service", "academic"]
  return keywords.filter((keyword) => description.toLowerCase().includes(keyword))
}

export default async function HomePage() {
  // Fetch vendors from database
  const vendors = await getAllVendors()

  // Sort vendors by some criteria to get "trending" ones
  // In a real app, this would be based on views, ratings, etc.
  const trendingVendors = [...vendors].sort(() => 0.5 - Math.random()).slice(0, 6)

  // Group vendors by category for the category tabs
  const foodVendors = vendors
    .filter(
      (v) =>
        v.description?.toLowerCase().includes("food") ||
        v.description?.toLowerCase().includes("coffee") ||
        v.description?.toLowerCase().includes("eat"),
    )
    .slice(0, 4)

  const serviceVendors = vendors
    .filter((v) => v.description?.toLowerCase().includes("service") || v.description?.toLowerCase().includes("print"))
    .slice(0, 4)

  const techVendors = vendors
    .filter((v) => v.description?.toLowerCase().includes("tech") || v.description?.toLowerCase().includes("repair"))
    .slice(0, 4)

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <NavBar />

      <div className="container px-4 py-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vendors or products..."
            className="pl-10 pr-4 py-6 rounded-full bg-secondary/50"
          />
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Link href="/browse?category=trending" className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <span className="text-xs text-center">Trending</span>
          </Link>

          <Link href="/browse?category=food" className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-2">
              <Utensils className="h-8 w-8 text-blue-500" />
            </div>
            <span className="text-xs text-center">Food</span>
          </Link>

          <Link href="/browse?category=tech" className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-2">
              <Wrench className="h-8 w-8 text-purple-500" />
            </div>
            <span className="text-xs text-center">Tech</span>
          </Link>

          <Link href="/browse?category=services" className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-2">
              <Coffee className="h-8 w-8 text-green-500" />
            </div>
            <span className="text-xs text-center">Coffee</span>
          </Link>
        </div>

        {/* Trending Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Trending Vendors
            </h2>
            <Link href="/browse" className="text-sm text-primary">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {trendingVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                id={vendor.id}
                name={vendor.businessName}
                description={vendor.description || "No description available"}
                image={vendor.logoImage || "/placeholder.svg?height=200&width=300"}
                rating={4.5}
                reviews={Math.floor(Math.random() * 200) + 10}
              />
            ))}
          </div>
        </div>

        {/* Categories Tabs */}
        <Tabs defaultValue="food" className="mb-8">
          <TabsList className="bg-secondary/50 p-1 mb-4">
            <TabsTrigger
              value="food"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Food
            </TabsTrigger>
            <TabsTrigger
              value="tech"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Tech
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="mt-0">
            <div className="grid grid-cols-2 gap-4">
              {foodVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  id={vendor.id}
                  name={vendor.businessName}
                  description={vendor.description || "No description available"}
                  image={vendor.logoImage || "/placeholder.svg?height=200&width=300"}
                  rating={4.5}
                  reviews={Math.floor(Math.random() * 200) + 10}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tech" className="mt-0">
            <div className="grid grid-cols-2 gap-4">
              {techVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  id={vendor.id}
                  name={vendor.businessName}
                  description={vendor.description || "No description available"}
                  image={vendor.logoImage || "/placeholder.svg?height=200&width=300"}
                  rating={4.5}
                  reviews={Math.floor(Math.random() * 200) + 10}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            <div className="grid grid-cols-2 gap-4">
              {serviceVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  id={vendor.id}
                  name={vendor.businessName}
                  description={vendor.description || "No description available"}
                  image={vendor.logoImage || "/placeholder.svg?height=200&width=300"}
                  rating={4.5}
                  reviews={Math.floor(Math.random() * 200) + 10}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recently Added Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Recently Added
            </h2>
            <Link href="/browse?sort=newest" className="text-sm text-primary">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {vendors.slice(0, 4).map((vendor) => (
              <VendorCard
                key={vendor.id}
                id={vendor.id}
                name={vendor.businessName}
                description={vendor.description || "No description available"}
                image={vendor.logoImage || "/placeholder.svg?height=200&width=300"}
                rating={4.5}
                reviews={Math.floor(Math.random() * 200) + 10}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </main>
  )
}
