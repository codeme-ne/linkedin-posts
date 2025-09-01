import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface PostSkeletonProps {
  platform?: string
}

export function PostSkeleton({ platform }: PostSkeletonProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        {/* Platform Icon Skeleton */}
        <Skeleton className="h-6 w-6 rounded-full" />
        
        {/* Platform Name Skeleton */}
        <Skeleton className="h-4 w-20" />
        
        {/* Copy Button Skeleton */}
        <div className="ml-auto">
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Post Content Lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
        
        {/* Platform-specific content */}
        {platform === 'linkedin' && (
          <div className="pt-2 border-t space-y-2">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[40%]" />
          </div>
        )}
        
        {platform === 'x' && (
          <div className="pt-2 space-y-2">
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[30%]" />
          </div>
        )}
        
        {platform === 'instagram' && (
          <div className="pt-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            {/* Hashtag area */}
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Subtle shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </Card>
  )
}

// Multi-platform skeleton
export function PostSkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <PostSkeleton platform="linkedin" />
      <PostSkeleton platform="x" />
      <PostSkeleton platform="instagram" />
    </div>
  )
}