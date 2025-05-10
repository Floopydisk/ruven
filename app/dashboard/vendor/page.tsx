import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { ArrowUpRight, ArrowDownRight, Users, ShoppingBag, CreditCard, TrendingUp } from "lucide-react"
import { neon } from "@neondatabase/serverless"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

// Check if user is a vendor
async function isVendor() {
  const authSession = cookies().get("auth_session")?.value

  if (!authSession) {
    return false
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`
      SELECT v.id, v.name FROM vendors v
      JOIN users u ON v.user_id = u.id
      JOIN sessions s ON u.id = s.user_id
      WHERE s.session_token = ${authSession}
    `

    return result.length > 0 ? result[0] : false
  } catch (error) {
    console.error("Error checking vendor status:", error)
    return false
  }
}

// Get vendor stats
async function getVendorStats(vendorId: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Get total products
    const productsResult = await sql`
      SELECT COUNT(*) as total FROM products WHERE vendor_id = ${vendorId}
    `

    // Get total orders (placeholder - would need an orders table)
    const ordersResult = await sql`
      SELECT 0 as total
    `

    // Get profile views (placeholder - would need a views table)
    const viewsResult = await sql`
      SELECT 0 as total
    `

    return {
      totalProducts: Number.parseInt(productsResult[0]?.total || "0"),
      totalOrders: Number.parseInt(ordersResult[0]?.total || "0"),
      totalSales: 0, // Placeholder
      profileViews: Number.parseInt(viewsResult[0]?.total || "0"),
      todaySales: 0, // Placeholder
    }
  } catch (error) {
    console.error("Error getting vendor stats:", error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalSales: 0,
      profileViews: 0,
      todaySales: 0,
    }
  }
}

export default async function VendorDashboardPage() {
  // Check if user is a vendor
  const vendorData = await isVendor()

  if (!vendorData) {
    redirect("/auth/login")
  }

  const stats = await getVendorStats(vendorData.id)
  const vendorName = vendorData.name || "Vendor"

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Hey {vendorName}</h2>
            <p className="text-muted-foreground">Here's what's happening with your store today</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Export</Button>
            <Button>Add Product</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.todaySales.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+36%</span>
                <span className="text-muted-foreground ml-1">from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</div>
              <div className="flex items-center text-xs text-red-500">
                <ArrowDownRight className="mr-1 h-4 w-4" />
                <span>-14%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+36%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profileViews.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+36%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales Report</CardTitle>
                <div className="flex gap-2">
                  <Tabs defaultValue="12">
                    <TabsList className="grid grid-cols-4 h-8">
                      <TabsTrigger value="12" className="text-xs">
                        12 Months
                      </TabsTrigger>
                      <TabsTrigger value="6" className="text-xs">
                        6 Months
                      </TabsTrigger>
                      <TabsTrigger value="30" className="text-xs">
                        30 Days
                      </TabsTrigger>
                      <TabsTrigger value="7" className="text-xs">
                        7 Days
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button variant="outline" size="sm">
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                {/* This would be a chart component in a real app */}
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">Sales chart will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Traffic Sources</CardTitle>
                <Button variant="ghost" size="sm">
                  Last 7 Days
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Direct</span>
                    <div className="mt-2 h-2 w-full max-w-[180px] rounded-full bg-muted">
                      <div className="h-full w-[80%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <span className="text-sm">1,43,382</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Referral</span>
                    <div className="mt-2 h-2 w-full max-w-[180px] rounded-full bg-muted">
                      <div className="h-full w-[60%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <span className="text-sm">87,974</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Social Media</span>
                    <div className="mt-2 h-2 w-full max-w-[180px] rounded-full bg-muted">
                      <div className="h-full w-[40%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <span className="text-sm">45,211</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Twitter</span>
                    <div className="mt-2 h-2 w-full max-w-[180px] rounded-full bg-muted">
                      <div className="h-full w-[20%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <span className="text-sm">21,893</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>Recent order transactions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  See All Transactions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-[25px_1fr_120px_120px] items-center gap-4 border-b pb-4">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-medium">Order #4831</div>
                    <div className="text-sm text-muted-foreground">Payment received</div>
                  </div>
                  <div className="text-right font-medium">$182.94</div>
                  <div className="text-right text-sm text-muted-foreground">Today</div>
                </div>

                <div className="grid grid-cols-[25px_1fr_120px_120px] items-center gap-4 border-b pb-4">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-medium">Order #6442</div>
                    <div className="text-sm text-muted-foreground">Payment received</div>
                  </div>
                  <div className="text-right font-medium">$99.00</div>
                  <div className="text-right text-sm text-muted-foreground">Yesterday</div>
                </div>

                <div className="grid grid-cols-[25px_1fr_120px_120px] items-center gap-4 border-b pb-4">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div>
                    <div className="font-medium">Order #8821</div>
                    <div className="text-sm text-muted-foreground">Pending payment</div>
                  </div>
                  <div className="text-right font-medium">$249.94</div>
                  <div className="text-right text-sm text-muted-foreground">2 days ago</div>
                </div>

                <div className="grid grid-cols-[25px_1fr_120px_120px] items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <div>
                    <div className="font-medium">Order #5666</div>
                    <div className="text-sm text-muted-foreground">Payment failed</div>
                  </div>
                  <div className="text-right font-medium">$199.24</div>
                  <div className="text-right text-sm text-muted-foreground">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Customers</CardTitle>
                  <CardDescription>Latest customer interactions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  See All Customers
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div>
                      <div className="font-medium">Jenny Wilson</div>
                      <div className="text-sm text-muted-foreground">j.wilson@example.com</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$11,234</div>
                    <div className="text-sm text-muted-foreground">Austin</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div>
                      <div className="font-medium">Devon Lane</div>
                      <div className="text-sm text-muted-foreground">d.roberts@example.com</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$11,159</div>
                    <div className="text-sm text-muted-foreground">New York</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div>
                      <div className="font-medium">Jane Cooper</div>
                      <div className="text-sm text-muted-foreground">j.graham@example.com</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$10,483</div>
                    <div className="text-sm text-muted-foreground">Toledo</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div>
                      <div className="font-medium">Dianne Russell</div>
                      <div className="text-sm text-muted-foreground">curtis.d@example.com</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$9,084</div>
                    <div className="text-sm text-muted-foreground">Naperville</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
