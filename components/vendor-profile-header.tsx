import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, MapPin, Globe, Phone } from "lucide-react"

type VendorProfileHeaderProps = {
  vendor: {
    id: number
    businessName: string
    description: string | null
    location: string | null
    website: string | null
    phone: string | null
    logoImage: string | null
    bannerImage: string | null
  }
  isOwner?: boolean
}

export function VendorProfileHeader({ vendor, isOwner = false }: VendorProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="h-48 md:h-64 relative">
        <Image
          src={vendor.bannerImage || "/placeholder.svg?height=400&width=1200"}
          alt={`${vendor.businessName} banner`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      {/* Logo and Business Info */}
      <div className="container px-4">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20 relative">
          {/* Logo */}
          <div className="h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-background relative">
            <Image
              src={vendor.logoImage || "/placeholder.svg?height=200&width=200"}
              alt={vendor.businessName}
              fill
              className="object-cover"
            />
          </div>

          {/* Business Info */}
          <div className="flex-1 pt-2 md:pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{vendor.businessName}</h1>
                {vendor.location && (
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{vendor.location}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {isOwner ? (
                  <Link href="/dashboard/vendor/profile">
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                ) : (
                  <Link href={`/messages/new?vendorId=${vendor.id}`}>
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {vendor.description && <p className="mt-4 text-muted-foreground">{vendor.description}</p>}

            <div className="flex flex-wrap gap-4 mt-4">
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  <span>Website</span>
                </a>
              )}
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{vendor.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
