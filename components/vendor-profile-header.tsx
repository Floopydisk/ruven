import Image from "next/image"
import { Star } from "lucide-react"

interface VendorProfileHeaderProps {
  name: string
  rating: number
  reviews: number
  bannerImage: string
  logoImage: string
}

export function VendorProfileHeader({ name, rating, reviews, bannerImage, logoImage }: VendorProfileHeaderProps) {
  return (
    <div className="relative h-48 md:h-64 w-full">
      <Image src={bannerImage || "/placeholder.svg"} alt={`${name} banner`} fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 md:p-6 flex items-end">
        <div className="relative h-16 w-16 md:h-24 md:w-24 rounded-full overflow-hidden border-4 border-background">
          <Image src={logoImage || "/placeholder.svg"} alt={`${name} logo`} fill className="object-cover" />
        </div>
        <div className="ml-4 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-medium">{rating}</span>
            <span className="ml-1">({reviews} reviews)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
