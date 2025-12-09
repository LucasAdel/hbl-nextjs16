import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-5 w-24 mb-4" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="h-7 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Integration Settings Skeleton */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-40" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>

              <div className="mt-4 p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Settings Skeleton */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded" />
                    <div>
                      <Skeleton className="h-5 w-36 mb-1" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                  </div>
                  <Skeleton className="w-11 h-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links Skeleton */}
        <section>
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
                <Skeleton className="w-8 h-8 rounded mb-2" />
                <Skeleton className="h-5 w-28 mb-1" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
