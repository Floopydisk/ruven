import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// Define two different interfaces for the two different use cases
interface IconVendorCardProps {
  icon: LucideIcon
  name: string
  description: string
  delay?: number
  id?: never
  image?: never
  rating?: never
  reviews?: never
}

interface ImageVendorCardProps {
  id: number | string
  name: string
  description: string
  image: string
  rating?: number
  reviews?: number
  icon?: never
  delay?: never
}

// Union type to accept either set of props
type VendorCardProps = IconVendorCardProps | ImageVendorCardProps

export function VendorCard(props: VendorCardProps) {
  // Check if we're using the icon version or the image version
  if ("icon" in props && props.icon) {
    const { icon: Icon, name, description, delay = 0 } = props

    return (
      <div className="relative group card-hover" style={{ animationDelay: `${delay}ms` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative bg-secondary/50 border border-primary/10 rounded-xl p-6 flex flex-col items-center text-center h-full">
          <div className="mb-4 rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">{name}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <Link href="/browse" className="mt-auto">
            <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 hover:text-primary">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    )
  } else {
    // Image version
    const { id, name, description, image, rating, reviews } = props

    return (
      <Link href={`/vendors/${id}`} className="block h-full">
        <div className="relative bg-card border rounded-lg overflow-hidden h-full transition-all hover:shadow-md hover:border-primary/20">
          <div className="aspect-video relative">
            <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
            {rating && (
              <div className="absolute bottom-2 left-2 flex items-center bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{rating.toFixed(1)}</span>
                {reviews && <span className="text-gray-300 ml-1">({reviews})</span>}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-1 line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
      </Link>
    )
  }
}
