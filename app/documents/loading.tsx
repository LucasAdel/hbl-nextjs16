import { DocumentCardSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-12">
        <div className="container-custom relative z-10">
          <PageHeaderSkeleton />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Skeleton */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="h-6 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1">
              {/* Search Bar Skeleton */}
              <div className="mb-6">
                <div className="h-12 bg-white rounded-xl border border-gray-200 animate-pulse" />
              </div>

              {/* Grid Skeleton */}
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <DocumentCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
