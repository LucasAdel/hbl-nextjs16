import { ConsultationCardSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function BookAppointmentLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-12">
        <div className="container-custom relative z-10">
          <PageHeaderSkeleton />

          {/* Stats Row Skeleton */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-16 mx-auto bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-24 mx-auto bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <ConsultationCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
