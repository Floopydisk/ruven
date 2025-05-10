import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe3D } from "@/components/globe-3d"
import { ModernNavbar } from "@/components/modern-navbar"
import { ArrowRight, Check, ShoppingBag, MessageSquare, Search, Star } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ModernNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0,_transparent_100%)]"></div>
          <div className="container relative z-10 px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Connect with Campus Vendors
              </h1>
              <p className="text-xl mb-8 text-slate-300 max-w-lg">
                Discover, message, and engage with the best vendors and services available on your university campus.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-slate-500 text-white hover:bg-slate-800"
                  >
                    Browse Vendors
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center text-sm text-slate-400">
                <Check className="mr-2 h-4 w-4 text-blue-500" />
                No credit card required
                <span className="mx-2">•</span>
                <Check className="mr-2 h-4 w-4 text-blue-500" />
                Free for students
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md h-80 md:h-96">
                <Globe3D />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in One Place</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                UniVendor brings together all campus vendors and services into a single, easy-to-use platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Discover Vendors</h3>
                <p className="text-slate-400">
                  Easily find and explore all the vendors and services available on your university campus.
                </p>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
                <p className="text-slate-400">
                  Communicate directly with vendors to ask questions, place orders, or request custom services.
                </p>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="w-12 h-12 rounded-full bg-pink-600/20 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reviews & Ratings</h3>
                <p className="text-slate-400">
                  Read and leave reviews to help others find the best vendors and services on campus.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vendor Section */}
        <section className="bg-slate-900 py-20">
          <div className="container px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-600/20 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-600/20 rounded-full blur-xl"></div>
                  <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 md:p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-slate-700 mr-4"></div>
                      <div>
                        <h3 className="text-xl font-semibold">Campus Coffee</h3>
                        <div className="flex items-center text-slate-400">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
                          <span>4.8</span>
                          <span className="mx-2">•</span>
                          <span>124 reviews</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-6">
                      "UniVendor has helped us connect with more students and grow our business on campus. The platform
                      is easy to use and has become an essential part of our marketing strategy."
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">- Sarah, Owner</span>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Are You a Campus Vendor?</h2>
                <p className="text-xl text-slate-300 mb-6">
                  Join UniVendor to showcase your products and services to the entire university community.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="mt-1 mr-3 h-5 w-5 text-blue-500" />
                    <span className="text-slate-300">Create a professional vendor profile</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-1 mr-3 h-5 w-5 text-blue-500" />
                    <span className="text-slate-300">Showcase your products and services</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-1 mr-3 h-5 w-5 text-blue-500" />
                    <span className="text-slate-300">Communicate directly with customers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-1 mr-3 h-5 w-5 text-blue-500" />
                    <span className="text-slate-300">Grow your campus business</span>
                  </li>
                </ul>
                <Link href="/sell">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Become a Vendor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of students and vendors already using UniVendor to connect and discover campus offerings.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                  >
                    Browse Vendors
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <ShoppingBag className="h-6 w-6 mr-2 text-blue-500" />
              <span className="font-bold text-xl">UniVendor</span>
            </div>
            <div className="text-sm text-slate-400">© {new Date().getFullYear()} UniVendor. All rights reserved.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
