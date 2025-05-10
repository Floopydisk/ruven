import { ProfileSkeleton } from "@/components/ui/skeletons"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>
      <ProfileSkeleton />
    </div>
  )
}
