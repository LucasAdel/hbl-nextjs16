import { ServiceCardSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-16">
        <div className="container-custom relative z-10">
          <PageHeaderSkeleton />
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 animate-pulse" />
                <div className="h-8 w-16 mx-auto bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-24 mx-auto bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid Skeleton */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
