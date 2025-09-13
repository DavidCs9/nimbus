import { Card } from "@/components/ui/card";

/**
 * Skeleton Components for EC2 Dashboard
 *
 * Provides loading skeletons that match the actual component layouts
 * for better UX during data fetching.
 */

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-700 rounded ${className}`}
      aria-label="Loading..."
    />
  );
}

/**
 * Skeleton for individual stats card
 */
export function StatsCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
    </Card>
  );
}

/**
 * Skeleton for the stats cards grid
 */
export function EC2StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
  );
}

/**
 * Skeleton for individual instance row
 */
export function InstanceRowSkeleton() {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-3 h-3 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div>
          <Skeleton className="h-3 w-12 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div>
          <Skeleton className="h-3 w-14 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div>
          <Skeleton className="h-3 w-18 mb-1" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the instances list
 */
export function EC2InstanceListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Card>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="p-4">
            <InstanceRowSkeleton />
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Skeleton for sidebar resource limit item
 */
export function ResourceLimitSkeleton() {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-8" />
    </div>
  );
}

/**
 * Skeleton for sidebar activity item
 */
export function ActivitySkeleton() {
  return (
    <div className="flex items-start space-x-3 mb-3">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the EC2 sidebar
 */
export function EC2SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Quick Actions Skeleton */}
      <Card className="p-4">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>

      {/* Resource Limits Skeleton */}
      <Card className="p-4">
        <Skeleton className="h-5 w-28 mb-4" />
        <ResourceLimitSkeleton />
        <ResourceLimitSkeleton />
        <ResourceLimitSkeleton />
      </Card>

      {/* Recent Activities Skeleton */}
      <Card className="p-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <ActivitySkeleton />
        <ActivitySkeleton />
        <ActivitySkeleton />
      </Card>
    </div>
  );
}
