import { Skeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-16">
        <div className="container-custom relative z-10">
          <PageHeaderSkeleton />
        </div>
      </section>

      {/* Contact Section Skeleton */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Skeleton */}
            <div>
              <Skeleton className="h-7 w-32 mb-6" />
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-32 w-full rounded-md" />
                </div>
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>

            {/* Contact Info Skeleton */}
            <div>
              <Skeleton className="h-7 w-28 mb-6" />
              <Skeleton className="h-72 w-full rounded-lg mb-8" />
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0 mr-4" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
