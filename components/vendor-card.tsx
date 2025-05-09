import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface VendorCardProps {
  icon: LucideIcon
  name: string
  description: string
  delay?: number
}

export function VendorCard({ icon: Icon, name, description, delay = 0 }: VendorCardProps) {
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
}
