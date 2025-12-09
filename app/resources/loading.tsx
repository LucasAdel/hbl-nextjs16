export default function ResourcesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="h-8 w-48 bg-gray-700 rounded-full mx-auto mb-6 animate-pulse" />
            <div className="h-12 md:h-16 w-3/4 bg-gray-700 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-2/3 bg-gray-700 rounded-lg mx-auto mb-8 animate-pulse" />
            <div className="h-14 max-w-2xl mx-auto bg-gray-700/50 rounded-xl animate-pulse" />
          </div>
        </div>
      </section>

      {/* Featured Posts Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded-lg mt-2 animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
                <div className="h-6 w-20 bg-gray-200 rounded-full mb-6 animate-pulse" />
                <div className="flex gap-3 mb-4">
                  <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse" />
                </div>
                <div className="h-8 w-full bg-gray-200 rounded-lg mb-3 animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded-lg mb-2 animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-100 rounded-lg mb-6 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-3 w-16 bg-gray-100 rounded-lg mt-1 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter Skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Posts Grid Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-4 w-24 bg-gray-100 rounded-md animate-pulse" />
                </div>
                <div className="h-6 w-full bg-gray-200 rounded-lg mb-2 animate-pulse" />
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-3 animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded-lg mb-2 animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded-lg mb-2 animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded-lg mb-4 animate-pulse" />
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-6 w-16 bg-gray-100 rounded-md animate-pulse"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-4 w-12 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
