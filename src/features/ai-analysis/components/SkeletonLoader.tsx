'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {/* Search Query Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Summary Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Documents Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Script Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <div className="p-4 bg-muted/30 rounded-lg">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mt-2" />
        </div>
      </div>
    </div>
  );
}
