import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
    />
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function ConsultationCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
      <div className="text-center mb-6">
        <Skeleton className="h-8 w-20 mx-auto mb-2" />
        <Skeleton className="h-4 w-16 mx-auto" />
      </div>
      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-4 w-full mb-1 mx-auto" />
      <Skeleton className="h-4 w-5/6 mx-auto mb-4" />
      <div className="flex items-center justify-center gap-2 mb-6">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start">
            <Skeleton className="h-4 w-4 mr-2 flex-shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="text-center py-12">
      <Skeleton className="h-8 w-32 mx-auto mb-4 rounded-full" />
      <Skeleton className="h-12 w-3/4 max-w-xl mx-auto mb-4" />
      <Skeleton className="h-5 w-full max-w-lg mx-auto mb-2" />
      <Skeleton className="h-5 w-4/5 max-w-md mx-auto" />
    </div>
  );
}
