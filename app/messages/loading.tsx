import { MessageSkeleton } from "@/components/ui/skeletons"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <MessageSkeleton key={i} />
          ))}
      </div>
    </div>
  )
}
