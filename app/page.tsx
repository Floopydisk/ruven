import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModernNavbar } from "@/components/modern-navbar"
import { Globe3D } from "@/components/globe-3d"
import { FeatureCard } from "@/components/feature-card"
import { VendorCard } from "@/components/vendor-card"
import {
  ArrowRight,
  ShoppingBag,
  MessageSquare,
  Search,
  Users,
  Star,
  Coffee,
  Printer,
  Laptop,
  Utensils,
  ChevronRight,
} from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <ModernNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col justify-center pt-16 overflow-hidden hero-grid">
        <div className="absolute inset-0 gradient-bg"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl"></div>

        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center justify-center text-center flex-grow">
          <div className="absolute inset-0 -z-10">
            <Globe3D />
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary border border-primary/20 backdrop-blur-sm mb-4">
              University Vendor App
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              <span className="text-gradient glow-text">Connect</span> with Campus Vendors
            </h1>
            <p className="text-muted-foreground md:text-xl max-w-[600px] mx-auto mb-8">
              Discover, connect, and engage with vendors across your university campus. From coffee shops to tech
              repair, find everything you need in one convenient app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <span className="flex items-center">
                    Browse Vendors <ArrowRight className="h-4 w-4 ml-2" />
                  </span>
                </Button>
              </Link>
              <Link href="/auth/register?type=vendor">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary border-2 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Register as Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative pb-16 w-full flex justify-center">
          <div className="bg-background/30 backdrop-blur-md px-4 py-2 rounded-full animate-bounce">
            <span className="text-sm text-primary font-medium mr-2">Scroll to explore</span>
            <ChevronRight className="h-5 w-5 text-primary rotate-90 inline-block" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 gradient-bg"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary border border-primary/20">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                Everything You Need in <span className="text-gradient">One App</span>
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Discover the powerful features that make connecting with campus vendors seamless and efficient.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={ShoppingBag}
              title="Vendor Profiles"
              description="Detailed profiles with business information, hours, and contact details."
              delay={100}
            />
            <FeatureCard
              icon={Search}
              title="Search & Browse"
              description="Easily find vendors by category, location, or specific products."
              delay={200}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Direct Messaging"
              description="Connect directly with vendors to ask questions or place orders."
              delay={300}
            />
            <FeatureCard
              icon={Users}
              title="User Accounts"
              description="Create a profile as a customer or vendor to access all features."
              delay={400}
            />
            <FeatureCard
              icon={Star}
              title="Reviews & Ratings"
              description="Read and leave reviews to help others find the best vendors."
              delay={500}
            />
            <FeatureCard
              icon={ShoppingBag}
              title="Product Listings"
              description="Browse products and services offered by each vendor."
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* Popular Vendors Section */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 gradient-bg"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary border border-primary/20">
                Popular Vendors
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                Discover <span className="text-gradient">Campus Favorites</span>
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Check out some of the most popular vendors on campus.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <VendorCard
              icon={Coffee}
              name="Campus Coffee"
              description="Premium coffee and snacks in a cozy atmosphere."
              delay={100}
            />
            <VendorCard
              icon={Printer}
              name="Print Shop"
              description="Professional printing services for all your needs."
              delay={200}
            />
            <VendorCard
              icon={Laptop}
              name="Tech Repair"
              description="Fast and reliable tech repair services."
              delay={300}
            />
            <VendorCard
              icon={Utensils}
              name="Fresh Eats"
              description="Healthy and delicious food options."
              delay={400}
            />
          </div>
          <div className="flex justify-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity"
            >
              View All Vendors <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 gradient-bg"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="gradient-border p-[1px] rounded-2xl">
              <div className="bg-secondary/50 backdrop-blur-sm rounded-2xl p-8 md:p-12">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                      Ready to <span className="text-gradient">Get Started</span>?
                    </h2>
                    <p className="text-muted-foreground md:text-xl/relaxed">
                      Join our community of students and vendors to enhance your campus experience.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                    <Link href="/auth/register">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        <span className="flex items-center">
                          Sign Up Now <ArrowRight className="h-4 w-4 ml-2" />
                        </span>
                      </Button>
                    </Link>
                    <Link href="/browse">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary border-2 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        Browse Vendors
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-primary/20 bg-background/80 backdrop-blur-md">
        <div className="absolute inset-0 gradient-bg opacity-20"></div>
        <div className="container relative z-10 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="flex items-center">
                <ShoppingBag className="h-8 w-8 mr-2 text-primary" />
                <span className="font-bold text-2xl">UniVendor</span>
              </Link>
              <p className="text-muted-foreground max-w-xs">
                Connect with campus vendors in one place. Discover, message, and engage with local businesses.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="#"
                  className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  href="#"
                  className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                  <span className="sr-only">Instagram</span>
                </a>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/browse" className="text-muted-foreground hover:text-primary transition-colors">
                    Browse Vendors
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Subscribe</h3>
              <p className="text-muted-foreground">Stay updated with our latest features and releases</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-l-md bg-secondary/50 border border-primary/20 px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="bg-primary text-primary-foreground rounded-r-md px-4 py-2 hover:bg-primary/90 transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-primary/10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} UniVendor. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              Designed with <span className="text-primary">♥</span> for university communities
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
